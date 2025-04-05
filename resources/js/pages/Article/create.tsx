import { plugins } from '@/components/constants/plugin';
import { toolbars } from '@/components/constants/toolbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Editor } from '@tinymce/tinymce-react';
import { useRef, useState } from 'react';
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

const Create: React.FC<ArticleIndexProps> = ({ categories }) => {
    const API_KEY = import.meta.env.VITE_TINY_MCE_API_KEY;
    const editorRef = useRef<any>(null);
    const [formData, setFormData] = useState<FormData>({
        title: '',
        category_id: '',
        description: '',
    });
    const [errors, setErrors] = useState<Errors>({});
    const [isProcessing, setIsProcessing] = useState<boolean>(false);

    const handleAddSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);

        try {
            await router.post(route('articles.store'), formData, {
                onSuccess: () => {
                    toast.success('Article created successfully');
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
    const handleEditorChange = (content: string) => {
        setFormData((prev) => ({
            ...prev,
            description: content,
        }));
    };

    const editorInit = {
        plugins: plugins.join(' '),
        toolbar: toolbars.join(' | '),
        height: 500,
        menubar: false,
        branding: false,
        content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
        images_upload_handler: async (blobInfo: any) => {
            try {
                const formData = new FormData();
                formData.append('file', blobInfo.blob(), blobInfo.filename());

                const response = await fetch('/upload', {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) throw new Error('Upload failed');

                const data = await response.json();
                return data.url;
            } catch (error) {
                console.error('Upload error:', error);
                toast.error('Failed to upload image');
                return '';
            }
        },
        setup: (editor: any) => {
            editorRef.current = editor;
        },
    };
    const handleCancel = () => {
        setFormData({
            title: '',
            category_id: '',
            description: '',
        });
        setErrors({});
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Article" />

            <div className="flex flex-col gap-4 p-4">
                <Card>
                    <CardHeader>
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div>
                                <CardTitle>Create Articles</CardTitle>
                                <CardDescription>Manage your Articles</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
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
                                    <Editor apiKey={API_KEY} value={formData.description} onEditorChange={handleEditorChange} init={editorInit} />
                                    {/* <Textarea
                                        id="description"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleFormChange}
                                        className="mt-1"
                                        disabled={isProcessing}
                                    /> */}

                                    {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
                                </div>

                                <div className="flex justify-end gap-2">
                                    <Button type="button" variant="outline" onClick={handleCancel} disabled={isProcessing}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={isProcessing}>
                                        {isProcessing ? 'Creating...' : 'Create'}
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
};

export default Create;
