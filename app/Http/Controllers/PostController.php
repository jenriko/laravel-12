<?php

namespace App\Http\Controllers;

use App\Http\Resources\ArticleResource;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use App\Models\Post;
use Illuminate\Http\Request;

class PostController extends Controller
{

    public function index(Request $request)
    {
        $categories = Category::all();
        $articles = Post::query()
            ->select('id', 'category_id', 'slug', 'user_id', 'title', 'description', 'created_at');
        if ($request->has('search')) {
            $search = $request->input('search');
            $articles->where(function ($query) use ($search) {
                $query->where('title', 'like', '%' . $search . '%');
            });
        }
        $articles = $articles->latest()->paginate(10);
        return inertia('Article/index', [
            'articles' => ArticleResource::collection($articles),
            'categories' => CategoryResource::collection($categories),
            'filters' => $request->only(['search']),
        ]);
    }
    public function create()
    {
        $categories = Category::all();
        return inertia('Article/create', [
            'categories' => CategoryResource::collection($categories),
        ]);
    }
    public function store(Request $request)
    {
        $userId = auth()->id();
        $request->validate([
            'category_id' => 'required|exists:categories,id',
            'title' => ['required', 'string'],
            'description' => ['required', 'string'],
        ]);
        Post::create([
            'category_id' => $request->category_id,
            'user_id' => $userId,
            'title' => $request->title,
            'slug' => strtolower(str_replace(' ', '-', $request->title)) . '-' . rand(1000, 9999),
            'description' => $request->description,
        ]);

        return to_route('articles.index')->with('success', 'Article created successfully');
    }
    public function update(Request $request, $slug)
    {
        $post = Post::where('slug', $slug)->firstOrFail();
        $userId = auth()->id();
        $request->validate([
            'category_id' => 'required|exists:categories,id',
            'title' => ['required', 'string'],
            'description' => ['required', 'string'],
        ]);

        $post->update([
            'category_id' => $request->category_id,
            'user_id' => $userId,
            'title' => $request->title,
            'slug' => strtolower(str_replace(' ', '-', $request->title)) . '-' . rand(1000, 9999),
            'description' => $request->description,
        ]);

        return to_route('articles.index')->with('success', 'Article Updated Successfully');
    }
    public function destroy($slug)
    {
        $post = Post::where('slug', $slug)->firstOrFail();
        $post->delete();
        return back()->with('success', 'Category deleted successfully');
    }
}
