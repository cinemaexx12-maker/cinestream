import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "@tanstack/react-router";
import { Edit2, Loader2, Plus, Shield, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Movie, MovieInput } from "../backend";
import Navbar from "../components/Navbar";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAdminCheck,
  useAdminMutations,
  useAllMovies,
} from "../hooks/useQueries";

const emptyForm: Omit<MovieInput, "year" | "duration"> & {
  year: string;
  duration: string;
} = {
  title: "",
  description: "",
  genre: "",
  year: "",
  rating: 0,
  duration: "",
  thumbnailUrl: "",
  videoUrl: "",
  isFeatured: false,
  categories: [],
};

type FormState = typeof emptyForm & { categoriesStr: string };

function toFormState(movie: Movie): FormState {
  return {
    title: movie.title,
    description: movie.description,
    genre: movie.genre,
    year: movie.year.toString(),
    rating: movie.rating,
    duration: movie.duration.toString(),
    thumbnailUrl: movie.thumbnailUrl,
    videoUrl: movie.videoUrl,
    isFeatured: movie.isFeatured,
    categories: movie.categories,
    categoriesStr: movie.categories.join(", "),
  };
}

export default function AdminPage() {
  const navigate = useNavigate();
  const { loginStatus } = useInternetIdentity();
  const isLoggedIn = loginStatus === "success";

  const { data: isAdmin, isLoading: checkingAdmin } = useAdminCheck();
  const { data: movies, isLoading: loadingMovies } = useAllMovies();
  const { addMovie, updateMovie, deleteMovie } = useAdminMutations();

  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const [deletingMovie, setDeletingMovie] = useState<Movie | null>(null);
  const [form, setForm] = useState<FormState>({
    ...emptyForm,
    categoriesStr: "",
  });

  useEffect(() => {
    if (!checkingAdmin && !isAdmin && !isLoggedIn) {
      navigate({ to: "/" });
    }
  }, [checkingAdmin, isAdmin, isLoggedIn, navigate]);

  const openAdd = () => {
    setEditingMovie(null);
    setForm({ ...emptyForm, categoriesStr: "" });
    setFormOpen(true);
  };

  const openEdit = (movie: Movie) => {
    setEditingMovie(movie);
    setForm(toFormState(movie));
    setFormOpen(true);
  };

  const openDelete = (movie: Movie) => {
    setDeletingMovie(movie);
    setDeleteOpen(true);
  };

  const handleSave = async () => {
    const input: MovieInput = {
      title: form.title.trim(),
      description: form.description.trim(),
      genre: form.genre.trim(),
      year: BigInt(form.year || 2024),
      rating: Number(form.rating),
      duration: BigInt(form.duration || 0),
      thumbnailUrl: form.thumbnailUrl.trim(),
      videoUrl: form.videoUrl.trim(),
      isFeatured: form.isFeatured,
      categories: form.categoriesStr
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean),
    };

    try {
      if (editingMovie) {
        await updateMovie.mutateAsync({ id: editingMovie.id, input });
        toast.success("Movie updated successfully");
      } else {
        await addMovie.mutateAsync(input);
        toast.success("Movie added successfully");
      }
      setFormOpen(false);
    } catch {
      toast.error("Failed to save movie. Please try again.");
    }
  };

  const handleDelete = async () => {
    if (!deletingMovie) return;
    try {
      await deleteMovie.mutateAsync(deletingMovie.id);
      toast.success("Movie deleted");
      setDeleteOpen(false);
    } catch {
      toast.error("Failed to delete movie.");
    }
  };

  const isSaving = addMovie.isPending || updateMovie.isPending;
  const isDeleting = deleteMovie.isPending;

  if (checkingAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <Shield className="w-16 h-16 text-muted-foreground" />
        <h1 className="text-2xl font-bold text-foreground">Access Denied</h1>
        <p className="text-muted-foreground">
          You need admin privileges to access this page.
        </p>
        <Button
          onClick={() => navigate({ to: "/" })}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          Back to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="pt-24 pb-16 px-4 sm:px-8 max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">
              Content Manager
            </h1>
            <p className="text-muted-foreground mt-1">
              {movies?.length ?? 0} movies in the library
            </p>
          </div>
          <Button
            onClick={openAdd}
            data-ocid="admin.add_button"
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-2"
          >
            <Plus className="w-4 h-4" /> Add Movie
          </Button>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          {loadingMovies ? (
            <div
              className="flex items-center justify-center py-20"
              data-ocid="admin.loading_state"
            >
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : !movies?.length ? (
            <div
              className="flex flex-col items-center justify-center py-20 gap-3"
              data-ocid="admin.empty_state"
            >
              <p className="text-muted-foreground">
                No movies yet. Add your first one!
              </p>
            </div>
          ) : (
            <Table data-ocid="admin.table">
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">Title</TableHead>
                  <TableHead className="text-muted-foreground hidden md:table-cell">
                    Genre
                  </TableHead>
                  <TableHead className="text-muted-foreground hidden lg:table-cell">
                    Year
                  </TableHead>
                  <TableHead className="text-muted-foreground hidden lg:table-cell">
                    Rating
                  </TableHead>
                  <TableHead className="text-muted-foreground hidden md:table-cell">
                    Featured
                  </TableHead>
                  <TableHead className="text-muted-foreground text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movies.map((movie) => (
                  <TableRow
                    key={movie.id.toString()}
                    data-ocid="admin.row"
                    className="border-border hover:bg-secondary/50 transition-colors"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {movie.thumbnailUrl && (
                          <img
                            src={movie.thumbnailUrl}
                            alt={movie.title}
                            className="w-10 h-14 object-cover rounded"
                          />
                        )}
                        <div>
                          <p className="font-medium text-foreground line-clamp-1">
                            {movie.title}
                          </p>
                          <p className="text-xs text-muted-foreground line-clamp-1 max-w-[200px]">
                            {movie.description}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {movie.genre}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground">
                      {movie.year.toString()}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <span className="text-yellow-400 font-medium">
                        ★ {movie.rating.toFixed(1)}
                      </span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {movie.isFeatured ? (
                        <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                          Featured
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={() => openEdit(movie)}
                          data-ocid="admin.edit_button"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => openDelete(movie)}
                          data-ocid="admin.delete_button"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </main>

      {/* Add / Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent
          data-ocid="admin.movie_form.dialog"
          className="bg-card border-border max-w-2xl max-h-[90vh] overflow-y-auto"
        >
          <DialogHeader>
            <DialogTitle className="text-foreground font-display text-xl">
              {editingMovie ? "Edit Movie" : "Add New Movie"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Fill in the details below.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
            <div className="sm:col-span-2 space-y-1.5">
              <Label className="text-foreground">Title</Label>
              <Input
                data-ocid="admin.title.input"
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                placeholder="e.g. The Dark Knight"
                className="bg-secondary border-border"
              />
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <Label className="text-foreground">Description</Label>
              <Textarea
                data-ocid="admin.description.textarea"
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="Movie synopsis..."
                className="bg-secondary border-border min-h-[80px]"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-foreground">Genre</Label>
              <Input
                data-ocid="admin.genre.input"
                value={form.genre}
                onChange={(e) =>
                  setForm((f) => ({ ...f, genre: e.target.value }))
                }
                placeholder="Action, Drama, Sci-Fi..."
                className="bg-secondary border-border"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-foreground">Year</Label>
              <Input
                data-ocid="admin.year.input"
                type="number"
                value={form.year}
                onChange={(e) =>
                  setForm((f) => ({ ...f, year: e.target.value }))
                }
                placeholder="2024"
                className="bg-secondary border-border"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-foreground">Rating (0–10)</Label>
              <Input
                data-ocid="admin.rating.input"
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={form.rating}
                onChange={(e) =>
                  setForm((f) => ({ ...f, rating: Number(e.target.value) }))
                }
                placeholder="8.5"
                className="bg-secondary border-border"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-foreground">Duration (minutes)</Label>
              <Input
                data-ocid="admin.duration.input"
                type="number"
                value={form.duration}
                onChange={(e) =>
                  setForm((f) => ({ ...f, duration: e.target.value }))
                }
                placeholder="152"
                className="bg-secondary border-border"
              />
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <Label className="text-foreground">Thumbnail URL</Label>
              <Input
                data-ocid="admin.thumbnail_url.input"
                value={form.thumbnailUrl}
                onChange={(e) =>
                  setForm((f) => ({ ...f, thumbnailUrl: e.target.value }))
                }
                placeholder="https://..."
                className="bg-secondary border-border"
              />
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <Label className="text-foreground">Video URL</Label>
              <Input
                data-ocid="admin.video_url.input"
                value={form.videoUrl}
                onChange={(e) =>
                  setForm((f) => ({ ...f, videoUrl: e.target.value }))
                }
                placeholder="https://... (YouTube embed or direct mp4)"
                className="bg-secondary border-border"
              />
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <Label className="text-foreground">
                Categories (comma-separated)
              </Label>
              <Input
                data-ocid="admin.categories.input"
                value={form.categoriesStr}
                onChange={(e) =>
                  setForm((f) => ({ ...f, categoriesStr: e.target.value }))
                }
                placeholder="Trending, New Release, Top Rated"
                className="bg-secondary border-border"
              />
            </div>

            <div className="sm:col-span-2 flex items-center gap-3">
              <Switch
                data-ocid="admin.featured.switch"
                checked={form.isFeatured}
                onCheckedChange={(checked) =>
                  setForm((f) => ({ ...f, isFeatured: checked }))
                }
                id="featured-switch"
              />
              <Label
                htmlFor="featured-switch"
                className="text-foreground cursor-pointer"
              >
                Feature this movie on the homepage banner
              </Label>
            </div>
          </div>

          <DialogFooter className="gap-2 mt-2">
            <Button
              variant="ghost"
              onClick={() => setFormOpen(false)}
              data-ocid="admin.cancel_button"
              disabled={isSaving}
              className="text-muted-foreground"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              data-ocid="admin.save_button"
              disabled={isSaving}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : editingMovie ? (
                "Update Movie"
              ) : (
                "Add Movie"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent
          data-ocid="admin.confirm_delete.dialog"
          className="bg-card border-border max-w-md"
        >
          <DialogHeader>
            <DialogTitle className="text-foreground">Delete Movie</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Are you sure you want to delete{" "}
              <span className="text-foreground font-semibold">
                {deletingMovie?.title}
              </span>
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="ghost"
              onClick={() => setDeleteOpen(false)}
              data-ocid="admin.cancel_button"
              disabled={isDeleting}
              className="text-muted-foreground"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              data-ocid="admin.confirm_button"
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground font-semibold"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
