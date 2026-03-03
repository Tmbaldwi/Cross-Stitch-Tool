export function displayBitmapOnCanvas(bitmap: ImageBitmap, canvas : HTMLCanvasElement) : void {
    const ctx = canvas.getContext('2d')!;

    canvas.width = bitmap.width;
    canvas.height = bitmap.height;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bitmap, 0, 0);
  }

export function clearCanvas(canvas : HTMLCanvasElement) : void {
  const ctx = canvas.getContext('2d');
  if(ctx){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  else{
    console.error("Error clearing canvas, could not get context")
  }
}