<?php

namespace App\Http\Controllers;

use App\Http\Resources\CategoryResource;
use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index(Request $request)
    {
        $categories = Category::query()
            ->select('id', 'name', 'slug', 'created_at');
        if ($request->has('search')) {
            $search = $request->input('search');
            $categories->where(function ($query) use ($search) {
                $query->where('name', 'like', '%' . $search . '%');
            });
        }
        $categories = $categories->latest()->paginate(10);
        return inertia('Category/index', [
            'categories' => CategoryResource::collection($categories),
            'filters' => $request->only(['search']),
        ]);
    }
    public function store(Request $request)
    {
        $request->validate([
            'name' => ['required', 'string'],
        ]);
        Category::create([
            'name' => $request->name,
            'slug' => strtolower(str_replace(' ', '-', $request->name)) . '-' . rand(1000, 9999),
        ]);
        return redirect()->route('categories.index')->with('success', 'Category created successfully');
    }
    public function update(Request $request, Category $category)
    {

        $request->validate([
            'name' => ['required', 'string'],
        ]);
        $slug = $request->slug ?: strtolower(str_replace(' ', '-', $request->name)) . '-' . rand(1000, 9999);
        $category->update([
            'name' => $request->name,
            'slug' => $slug,
        ]);
        return to_route('categories.index');
    }
    public function destroy(Category $category)
    {
        $category->delete();
        return back()->with('success', 'Category deleted successfully');
    }
}
