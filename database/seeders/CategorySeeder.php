<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        // Parent Categories
        $electronics = Category::create([
            'name' => 'Electronics',
            'description' => 'Gadgets and electronic devices.',
        ]);

        $books = Category::create([
            'name' => 'Books',
            'description' => 'Physical and digital books.',
        ]);

        // Child Categories
        Category::create([
            'name' => 'Smartphones',
            'parent_id' => $electronics->id,
            'description' => 'Latest mobile devices.',
        ]);

        Category::create([
            'name' => 'Programming Books',
            'parent_id' => $books->id,
            'description' => 'Learn to code.',
        ]);
    }
}