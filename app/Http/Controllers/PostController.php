<?php

namespace App\Http\Controllers;

use App\Http\Resources\ArticleResource;
use App\Models\Post;
use Illuminate\Http\Request;

class PostController extends Controller
{

    public function index(Request $request)
    {
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
            'filters' => $request->only(['search']),
        ]);
    }
}
