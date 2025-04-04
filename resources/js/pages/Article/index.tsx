import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { MoreHorizontal, PenBox, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface BreadcrumbItem {
    title: string;
    href: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Article',
        href: '/posts',
    },
];

interface PaginationMeta {
    current_page: number;
    last_page: number;
    total: number;
}

interface Article {
    id: number;
    title: string;
    slug: string;
    category_id: number;
    user_id: number;
    description: string;
    created_at: string;
    category?: {
        id: number;
        name: string;
    };
    user?: {
        id: number;
        name: string;
    };
}

interface Category {
    id: number;
    name: string;
}

interface ArticleIndexProps {
    articles: {
        data: Article[];
        meta: PaginationMeta;
    };
    categories: {
        data: Category[]; // categories is an object with data array
        meta: PaginationMeta;
    };
    filters: {
        search?: string;
    };
}
interface FormData {
    title: string;
    category_id: string; // Changing to string as the category_id is being handled as a string in the form
    description: string;
}

interface Errors {
    [key: string]: string;
}
const Index: React.FC<ArticleIndexProps> = ({ articles, categories, filters }) => {
    const { data: articlesData, meta } = articles;
    const [isAddDialogOpen, setIsAddDialogOpen] = useState<boolean>(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [articleToDelete, setarticleToDelete] = useState<Category | null>(null);
    const [currentArticle, setCurrentArticle] = useState<Article | null>(null);
    const [formData, setFormData] = useState<FormData>({
        title: '',
        category_id: '',
        description: '',
    });
    const [errors, setErrors] = useState<Errors>({});
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [search, setSearch] = useState<string>(filters.search || '');

    const handleSearch = (value: string) => {
        setSearch(value);
        router.get(
            route('articles.index'),
            { search: value },
            {
                preserveState: true,
                replace: true,
                preserveScroll: true,
            },
        );
    };

    const handleOpenAddDialog = () => {
        setFormData({ title: '', category_id: '', description: '' });
        setErrors({});
        setIsAddDialogOpen(true);
    };

    const handleOpenEditDialog = (article: Article) => {
        setCurrentArticle(article);
        setFormData({
            title: article.title,
            category_id: article.category ? article.category.id.toString() : '',
            description: article.description,
        });
        setIsEditDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setIsEditDialogOpen(false);
        setIsAddDialogOpen(false);
        setErrors({});
    };

    const handleAddSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);

        try {
            await router.post(route('articles.store'), formData, {
                onSuccess: () => {
                    toast.success('Article created successfully');
                    handleCloseDialog();
                },
                onError: (errors) => {
                    setErrors(errors);
                    toast.error('Failed to create article');
                },
            });
        } finally {
            setIsProcessing(false);
        }
    };
    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);

        if (!currentArticle) return;

        try {
            await router.put(route('articles.update', currentArticle.slug), formData, {
                onSuccess: () => {
                    toast.success('Article updated successfully');
                    handleCloseDialog();
                },
                onError: (errors) => {
                    setErrors(errors);
                    toast.error('Failed to update article');
                },
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleDeleteClick = (article: Article) => {
        setarticleToDelete(article);
        setIsDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!articleToDelete) return;

        setIsProcessing(true);
        try {
            await router.delete(route('articles.destroy', articleToDelete.slug), {
                onSuccess: () => {
                    toast.success('Article deleted successfully');
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
            <Head title="Article" />

            <div className="flex flex-col gap-4 p-4">
                <Card>
                    <CardHeader>
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div>
                                <CardTitle>Articles</CardTitle>
                                <CardDescription>Manage your Articles</CardDescription>
                            </div>
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                <Input
                                    placeholder="Search articles..."
                                    value={search}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    className="w-full sm:w-64"
                                />
                                <Button onClick={handleOpenAddDialog} className="whitespace-nowrap">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Article
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
                                        <TableHead>Title</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead>Author</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Created At</TableHead>
                                        <TableHead className="w-[100px] text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {articlesData.length > 0 ? (
                                        articlesData.map((article, index) => (
                                            <TableRow key={article.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                                <TableCell>{meta.from + index}</TableCell>
                                                <TableCell className="font-medium">{article.title}</TableCell>
                                                <TableCell className="font-medium">{article.category?.name}</TableCell>
                                                <TableCell className="font-medium">{article.user?.name}</TableCell>
                                                <TableCell className="font-medium">{article.description.substring(0, 50)}...</TableCell>
                                                <TableCell>{article.created_at}</TableCell>
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
                                                                onClick={() => handleOpenEditDialog(article)}
                                                                className="cursor-pointer"
                                                            >
                                                                <PenBox className="mr-2 h-4 w-4 text-blue-500" />
                                                                Edit
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                className="cursor-pointer text-red-500 focus:text-red-500"
                                                                onClick={() => handleDeleteClick(article)}
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
                                            <TableCell colSpan={7} className="h-24 text-center">
                                                No articles found
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Article</DialogTitle>
                            <DialogDescription>Enter the details for the new article</DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleAddSubmit}>
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="title">Title</Label>
                                    <Input
                                        id="title"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleFormChange}
                                        className="mt-1"
                                        disabled={isProcessing}
                                    />
                                    {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="category_id">Category</Label>
                                    <Select
                                        name="category_id"
                                        value={formData.category_id}
                                        onValueChange={(value) => handleSelectChange('category_id', value)}
                                    >
                                        <SelectTrigger className="mt-1 w-full">
                                            <SelectValue placeholder="Select a category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectLabel>Categories</SelectLabel>
                                                {categories.data.map((category) => (
                                                    <SelectItem key={category.id} value={category.id.toString()}>
                                                        {category.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                    {errors.category_id && <p className="mt-1 text-sm text-red-500">{errors.category_id}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleFormChange}
                                        className="mt-1"
                                        disabled={isProcessing}
                                    />
                                    {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
                                </div>

                                <div className="flex justify-end gap-2">
                                    <Button type="button" variant="outline" onClick={handleCloseDialog} disabled={isProcessing}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={isProcessing}>
                                        {isProcessing ? 'Creating...' : 'Create'}
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>

                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Article</DialogTitle>
                            <DialogDescription>Update the details for this article</DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleEditSubmit}>
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="title">Title</Label>
                                    <Input
                                        id="title"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleFormChange}
                                        className="mt-1"
                                        disabled={isProcessing}
                                    />
                                    {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="category_id">Category</Label>
                                    <Select
                                        name="category_id"
                                        value={formData.category_id}
                                        onValueChange={(value) => handleSelectChange('category_id', value)}
                                    >
                                        <SelectTrigger className="mt-1 w-full">
                                            <SelectValue placeholder="Select a category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectLabel>Categories</SelectLabel>
                                                {categories.data.map((category) => (
                                                    <SelectItem key={category.id} value={category.id.toString()}>
                                                        {category.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                    {errors.category_id && <p className="mt-1 text-sm text-red-500">{errors.category_id}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleFormChange}
                                        className="mt-1"
                                        disabled={isProcessing}
                                    />
                                    {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
                                </div>

                                <div className="flex justify-end gap-2">
                                    <Button type="button" variant="outline" onClick={handleCloseDialog} disabled={isProcessing}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={isProcessing}>
                                        {isProcessing ? 'Updating...' : 'Update'}
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
                            <DialogDescription>Are you sure you want to delete the article ? This action cannot be undone.</DialogDescription>
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
            </div>
        </AppLayout>
    );
};

export default Index;
