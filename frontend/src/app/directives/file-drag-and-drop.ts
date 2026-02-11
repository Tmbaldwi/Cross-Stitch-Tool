import { Directive, HostBinding, HostListener, output, OutputEmitterRef } from '@angular/core';

@Directive({
  selector: '[appFileDragAndDrop]',
})
export class FileDragAndDrop {
  public fileChangesEmitter : OutputEmitterRef<FileList> = output<FileList>();
  @HostBinding('style.border') public borderStyle = "4px dashed";
  @HostBinding('style.border-color') public borderColor = 'grey';
  @HostBinding('style.border-radius') public borderRadius = "8px";

  constructor() { }

  @HostListener('dragover', ['$event']) public onDragOver(event: any){
    event.preventDefault();
    event.stopPropagation();

    // visual
    this.borderColor = 'white';
  }

  @HostListener('dragleave', ['$event']) public onDragLeave(event: any){
    event.preventDefault();
    event.stopPropagation();

    // visual
    this.borderColor = 'grey';
  }

  @HostListener('drop', ['$event']) public onDrop(event: any){
    event.preventDefault();
    event.stopPropagation();

    let files: FileList = event.dataTransfer.files;
    this.fileChangesEmitter.emit(files);

    // visual
    this.borderColor = 'grey';
  }
}
