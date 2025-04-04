<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Carbon;

class ArticleResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'user' => $this->whenLoaded('user', new UserResource($this->user)),
            'category' => $this->when($this->category, new CategoryResource($this->category)),
            'description' => $this->description,
            'created_at' => Carbon::parse($this->created_at)->format('d M Y'),
        ];
    }
}
