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
                $query->where('name', 'like', '%' . $search . '%');
            });
        }
        $articles = $articles->latest()->paginate(10);
        return inertia('Article/index', [
            'articles' => ArticleResource::collection($articles),
            'categories' => CategoryResource::collection($categories),
            'filters' => $request->only(['search']),
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

        return redirect()->route('articles.index')->with('success', 'Article created successfully');
    }
}
