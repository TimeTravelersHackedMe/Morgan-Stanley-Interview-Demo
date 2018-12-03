import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sortBy'
})
export class SortByPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    const field = args[1];
    const asc = args[0];
    if (args.length !== 2 || !value) {
      return value;
    } else {
      value.sort((a: any, b: any) => {
        if (a[field] < b[field]) {
          return asc ? -1 : 1;
        } else if (a[field] > b[field]) {
          return asc ? 1 : -1;
        } else {
          return 0;
        }
      });
      return value;
    }
  }

}
