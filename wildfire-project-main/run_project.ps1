Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "cd backend; ..\.venv\Scripts\uvicorn.exe app:app --reload" -WindowStyle Normal
Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev" -WindowStyle Normal
