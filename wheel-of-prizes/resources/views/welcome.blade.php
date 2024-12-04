<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" type="text/css" href="{{ asset('css/app.css') }}">
    <!-- Spin Wheel CSS -->
<link href="https://cdn.jsdelivr.net/npm/spin-wheel/dist/spin-wheel.css" rel="stylesheet">

<!-- Spin Wheel JS -->
<script src="https://cdn.jsdelivr.net/npm/spin-wheel/dist/spin-wheel.js"></script>
    <title>Wheel of fortune</title>
</head>
<body style="background-color:#2371b9">
    <div id="wheel"  ></div>
</body>
</html>

<script src="{{ mix('js/wheel.js') }}"></script>
