import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, MoreHorizontal, PenBox, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface Category {
    id: number;
    name: string;
    slug: string;
    created_at: string;
}

interface PaginationMeta {
    current_page: number;
    from: number;
    last_page: number;
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
    path: string;
    per_page: number;
    to: number;
    total: number;
}

interface CategoryIndexProps {
    categories: {
        data: Category[];
        meta: PaginationMeta;
    };
    filters: {
        search?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Categories', href: '/categories' }];

const Index: React.FC<CategoryIndexProps> = ({ categories, filters }) => {
    const { data: categoriesData, meta } = categories;
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
    const [formData, setFormData] = useState({
        name: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isProcessing, setIsProcessing] = useState(false);
    const [search, setSearch] = useState(filters.search || '');

    // Search handler with debounce
    const handleSearch = (value: string) => {
        setSearch(value);
        router.get(
            route('categories.index'),
            { search: value },
            {
                preserveState: true,
                replace: true,
                preserveScroll: true,
            },
        );
    };

    // Pagination handlers
    const handlePageChange = (page: number) => {
        router.get(
            meta.path,
            { page },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    // Open/Close Dialogs
    const handleOpenAddDialog = () => {
        setFormData({ name: '' });
        setErrors({});
        setIsAddDialogOpen(true);
    };

    const handleOpenEditDialog = (category: Category) => {
        setCurrentCategory(category);
        setFormData({
            name: category.name,
        });
        setIsEditDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setIsEditDialogOpen(false);
        setIsAddDialogOpen(false);
        setErrors({});
    };

    // Form Handling
    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    // Submit Handlers
    const handleAddSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);

        try {
            await router.post(route('categories.store'), formData, {
                onSuccess: () => {
                    toast.success('Category created successfully');
                    handleCloseDialog();
                },
                onError: (errors) => {
                    setErrors(errors);
                    toast.error('Failed to create category');
                },
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentCategory) return;

        setIsProcessing(true);

        try {
            await router.put(route('categories.update', currentCategory.slug), formData, {
                onSuccess: () => {
                    toast.success('Category updated successfully');
                    handleCloseDialog();
                },
                onError: (errors) => {
                    setErrors(errors);
                    toast.error('Failed to update category');
                },
            });
        } finally {
            setIsProcessing(false);
        }
    };
    const handleDeleteClick = (category: Category) => {
        setCategoryToDelete(category);
        setIsDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!categoryToDelete) return;

        setIsProcessing(true);
        try {
            await router.delete(route('categories.destroy', categoryToDelete.slug), {
                onSuccess: () => {
                    toast.success('Category deleted successfully');
                    setIsDeleteDialogOpen(false);
                },
                onError: () => {
                    toast.error('Failed to delete category');
                },
            });
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Categories" />

            <div className="flex flex-col gap-4 p-4">
                <Card>
                    <CardHeader>
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div>
                                <CardTitle>Categories</CardTitle>
                                <CardDescription>Manage your product categories</CardDescription>
                            </div>
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                <Input
                                    placeholder="Search categories..."
                                    value={search}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    className="w-full sm:w-64"
                                />
                                <Button onClick={handleOpenAddDialog} className="whitespace-nowrap">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Category
                                </Button>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader className="bg-gray-50 dark:bg-gray-800">
                                    <TableRow>
                                        <TableHead className="w-[50px]">#</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Created At</TableHead>
                                        <TableHead className="w-[100px] text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {categoriesData.length > 0 ? (
                                        categoriesData.map((category, index) => (
                                            <TableRow key={category.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                                <TableCell>{meta.from + index}</TableCell>
                                                <TableCell className="font-medium">{category.name}</TableCell>
                                                <TableCell>
                                                    {new Date(category.created_at).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric',
                                                    })}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                                <span className="sr-only">Actions</span>
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-[150px]">
                                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                            <DropdownMenuItem
                                                                onClick={() => handleOpenEditDialog(category)}
                                                                className="cursor-pointer"
                                                            >
                                                                <PenBox className="mr-2 h-4 w-4 text-blue-500" />
                                                                Edit
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                className="cursor-pointer text-red-500 focus:text-red-500"
                                                                onClick={() => handleDeleteClick(category)}
                                                            >
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                Delete
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={4} className="h-24 text-center">
                                                No categories found
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>

                            {meta.total > meta.per_page && (
                                <div className="flex items-center justify-between border-t px-4 py-3">
                                    <div className="text-muted-foreground text-sm">
                                        Showing <span className="font-medium">{meta.from}</span> to <span className="font-medium">{meta.to}</span> of{' '}
                                        <span className="font-medium">{meta.total}</span> results
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Button variant="outline" size="sm" onClick={() => handlePageChange(1)} disabled={meta.current_page === 1}>
                                            <ChevronsLeft className="h-4 w-4" />
                                            <span className="sr-only">First page</span>
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handlePageChange(meta.current_page - 1)}
                                            disabled={meta.current_page === 1}
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                            <span className="sr-only">Previous page</span>
                                        </Button>
                                        <div className="text-sm">
                                            Page {meta.current_page} of {meta.last_page}
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handlePageChange(meta.current_page + 1)}
                                            disabled={meta.current_page === meta.last_page}
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                            <span className="sr-only">Next page</span>
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handlePageChange(meta.last_page)}
                                            disabled={meta.current_page === meta.last_page}
                                        >
                                            <ChevronsRight className="h-4 w-4" />
                                            <span className="sr-only">Last page</span>
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Add Category Dialog */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Category</DialogTitle>
                        <DialogDescription>Enter the details for the new category</DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleAddSubmit}>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="name">Category Name</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleFormChange}
                                    className="mt-1"
                                    disabled={isProcessing}
                                />
                                {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" onClick={handleCloseDialog} disabled={isProcessing}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isProcessing}>
                                    {isProcessing ? 'Creating...' : 'Create Category'}
                                </Button>
                            </div>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Category Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Category</DialogTitle>
                        <DialogDescription>Update the category details below</DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleEditSubmit}>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="name">Category Name</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleFormChange}
                                    className="mt-1"
                                    disabled={isProcessing}
                                />
                                {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" onClick={handleCloseDialog} disabled={isProcessing}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isProcessing}>
                                    {isProcessing ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </div>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Deletion</DialogTitle>
                        <DialogDescription>Are you sure you want to delete the category ? This action cannot be undone.</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isProcessing}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleConfirmDelete} disabled={isProcessing}>
                            {isProcessing ? 'Deleting...' : 'Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
};

export default Index;
