import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'removeMinusSign'
})
export class RemoveMinusSignPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    return Math.abs(value);
  }

}
