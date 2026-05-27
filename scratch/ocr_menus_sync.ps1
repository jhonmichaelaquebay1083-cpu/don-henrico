$OcrEngineType = [Windows.Media.Ocr.OcrEngine, Windows.Media.Ocr, ContentType=WindowsRuntime]
$BitmapDecoderType = [Windows.Graphics.Imaging.BitmapDecoder, Windows.Graphics.Imaging, ContentType=WindowsRuntime]
$StorageFileType = [Windows.Storage.StorageFile, Windows.Storage, ContentType=WindowsRuntime]

$engine = [Windows.Media.Ocr.OcrEngine]::TryCreateFromUserProfileLanguages()
if (-not $engine) {
    $engine = [Windows.Media.Ocr.OcrEngine]::TryCreateFromLanguage([Windows.Globalization.Language]::new("en-US"))
}

if (-not $engine) {
    Write-Error "Could not create OCR engine"
    exit
}

$files = Get-ChildItem "C:\Users\jhonm\Downloads\menus\*.jpg"
foreach ($file in $files) {
    Write-Output "========================================"
    Write-Output "FILE: $($file.Name)"
    Write-Output "========================================"
    try {
        $storageFileTask = [Windows.Storage.StorageFile]::GetFileFromPathAsync($file.FullName)
        while ($storageFileTask.Status -eq 0) { Start-Sleep -Milliseconds 10 }
        $storageFile = $storageFileTask.GetResults()

        $streamTask = $storageFile.OpenAsync([Windows.Storage.FileAccessMode]::Read)
        while ($streamTask.Status -eq 0) { Start-Sleep -Milliseconds 10 }
        $stream = $streamTask.GetResults()

        $decoderTask = [Windows.Graphics.Imaging.BitmapDecoder]::CreateAsync($stream)
        while ($decoderTask.Status -eq 0) { Start-Sleep -Milliseconds 10 }
        $decoder = $decoderTask.GetResults()

        $bitmapTask = $decoder.GetSoftwareBitmapAsync()
        while ($bitmapTask.Status -eq 0) { Start-Sleep -Milliseconds 10 }
        $bitmap = $bitmapTask.GetResults()

        $ocrTask = $engine.RecognizeAsync($bitmap)
        while ($ocrTask.Status -eq 0) { Start-Sleep -Milliseconds 10 }
        $result = $ocrTask.GetResults()

        Write-Output $result.Text
    } catch {
        Write-Output "ERROR: $_"
    }
}
