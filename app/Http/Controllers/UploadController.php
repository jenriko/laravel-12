<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class UploadController extends Controller
{
    public function uploadImage(Request $request)
    {
        try {
            // Validasi request
            $request->validate([
                'file' => 'required|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            ]);

            // Pastikan file ada
            if (!$request->hasFile('file')) {
                return response()->json(['error' => 'No file uploaded'], 400);
            }

            $file = $request->file('file');

            // Generate nama file unik
            $fileName = Str::uuid() . '.' . $file->getClientOriginalExtension();

            // Simpan file ke storage
            $path = $file->storeAs('public/uploads', $fileName);

            // Generate URL yang dapat diakses publik
            $url = Storage::url($path);

            return response()->json([
                'location' => asset($url) // TinyMCE mengharapkan properti 'location'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
