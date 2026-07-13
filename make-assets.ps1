Add-Type -AssemblyName System.Drawing

function Resize-Cover($srcPath, $dstPath, $w, $h) {
    $src = [System.Drawing.Image]::FromFile($srcPath)
    $bmp = New-Object System.Drawing.Bitmap($w, $h)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

    # Scale to cover the target box, then center-crop
    $scale = [Math]::Max($w / $src.Width, $h / $src.Height)
    $nw = [int][Math]::Ceiling($src.Width * $scale)
    $nh = [int][Math]::Ceiling($src.Height * $scale)
    $x = [int](($w - $nw) / 2)
    $y = [int](($h - $nh) / 2)

    $g.DrawImage($src, $x, $y, $nw, $nh)
    $g.Dispose()
    $bmp.Save($dstPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    $src.Dispose()
    Write-Host "Created $dstPath ($w x $h)"
}

$root = "C:\laragon\www\template_html_resto"
New-Item -ItemType Directory -Force -Path "$root\images\previews" | Out-Null

Resize-Cover "$root\images\logo-src.png" "$root\images\logo.png" 200 200

$previews = @(
    @{ src = "hero-deck.png";      dst = "preview-1-sunny-deck.png" },
    @{ src = "room-galley.png";    dst = "preview-2-galley.png" },
    @{ src = "room-aquarium.png";  dst = "preview-3-aquarium.png" },
    @{ src = "room-library.png";   dst = "preview-4-library.png" },
    @{ src = "room-crowsnest.png"; dst = "preview-5-crowsnest.png" },
    @{ src = "room-lawndeck.png";  dst = "preview-6-lawndeck.png" }
)

foreach ($p in $previews) {
    Resize-Cover "$root\images\$($p.src)" "$root\images\previews\$($p.dst)" 1600 800
}
