import { Pipe, PipeTransform } from '@angular/core';
import { ISection } from '../services/section.service';

@Pipe({
  name: 'filterSection',
  pure:true

})
export class FilterSectionPipe implements PipeTransform {

  transform(sections: ISection[], valor: string): any {
    if (!sections || !valor) {
      return sections;
    }
    return sections.filter(item => {
      valor = valor.toLowerCase();
      let itemNew = Object.assign({}, item);

      if (itemNew.title !== null) {
        itemNew.title = item.title.toLowerCase();
        if (itemNew.title.indexOf(valor) !== -1)
          return item;
      }
      if (itemNew.description !== null) {
        itemNew.description = item.description.toLowerCase();
        if (itemNew.description.indexOf(valor) !== -1)
          return item;
      }
    });
  }

}
