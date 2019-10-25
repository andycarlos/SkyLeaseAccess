import { Pipe, PipeTransform } from '@angular/core';
import { IUser } from '../services/user.service';

@Pipe({
  name: 'filterUser'
})
export class FilterUserPipe implements PipeTransform {

  transform(value: IUser[], valor: string): any {
    if (!value||!valor)
      return value;
    return value.filter(item => {

      valor = valor.toLowerCase();
      let itemNew = Object.assign({}, item);

      if (itemNew.email !== null){
        itemNew.email = item.email.toLowerCase();
        if (itemNew.email.indexOf(valor) !== -1)
          return item
      }
      if (itemNew.lastname !== null){
        itemNew.lastname = item.lastname.toLowerCase();
        if (itemNew.lastname.indexOf(valor) !== -1)
          return item
      }
      if (itemNew.name !== null) {
        itemNew.name = item.name.toLowerCase();
        if (itemNew.name.indexOf(valor) !== -1)
          return item
      }
      if (itemNew.category !== null) {
        itemNew.category = item.category.toLowerCase();
        if (itemNew.category.indexOf(valor) !== -1)
          return item
      }
    });
  }

}
