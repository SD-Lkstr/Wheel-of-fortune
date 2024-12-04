<?php

namespace App\Http\Controllers;
use GuzzleHttp\Client;
use Illuminate\Http\Request;

class WheelController extends Controller
{
    public function uploadFile(Request $request)
    {
        // Validate the uploaded file
        $request->validate([
            'file' => 'required|file|mimes:txt|max:10240',
        ]);

        $file = $request->file('file');

        // Read the content of the file
        $fileContent = file_get_contents($file->getRealPath());
        
        // Parse the content - assuming the text file has "name,category" format
        $lines = explode("\n", $fileContent);
        $segments = [];

        foreach ($lines as $line) {
            $data = str_getcsv($line);
            if (count($data) == 2) {
                $segments[] = [
                    'name' => trim($data[0]),
                    'category' => trim($data[1]),
                ];
            }
        }

        // Return the segments as a JSON response
        return response()->json(['segments' => $segments]);
    }
}
