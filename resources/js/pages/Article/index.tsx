import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { MoreHorizontal, PenBox, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Article',
        href: '/posts',
    },
];
interface ArticleIndexProps {
    categories: {
        data: Article[];
        meta: PaginationMeta;
    };
    filters: {
        search?: string;
    };
}

const Index: React.FC<ArticleIndexProps> = ({ articles, filters }) => {
    const { data: articlesData, meta } = articles;
    const [search, setSearch] = useState(filters.search || '');

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
                                <Button
                                    // onClick={handleOpenAddDialog}
                                    className="whitespace-nowrap"
                                >
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
                                        <TableHead>User</TableHead>
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
                                                <TableCell className="font-medium">{article.category_id}</TableCell>
                                                <TableCell className="font-medium">{article.user_id}</TableCell>
                                                <TableCell className="font-medium">{article.description}</TableCell>
                                                <TableCell>
                                                    {new Date(article.created_at).toLocaleDateString('en-US', {
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
                                                No articles found
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
};
export default Index;
