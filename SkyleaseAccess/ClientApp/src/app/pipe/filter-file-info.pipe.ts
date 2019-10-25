import { Pipe, PipeTransform } from '@angular/core';
import { IFileInfo } from '../services/section.service';

@Pipe({
  name: 'filterFileInfo'
})
export class FilterFileInfoPipe implements PipeTransform {

  transform(file: IFileInfo[], valor: string): any {
    if (!file || !valor) {
      return file;
    }
    return file.filter(item => {
      valor = valor.toLowerCase();
      let itemNew = Object.assign({}, item);

      if (itemNew.fileName !== null) {
        itemNew.fileName = item.fileName.toLowerCase();
        if (itemNew.fileName.indexOf(valor) !== -1)
          return item;
      }
    });
  }

}
