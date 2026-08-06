<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('document_metadata', function (Blueprint $table) {
            $table->date('issue_at')->nullable()->after('status');
        });
    }

    public function down(): void
    {
        Schema::table('document_metadata', function (Blueprint $table) {
            $table->dropColumn('issue_at');
        });
    }
};
