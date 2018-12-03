import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';

import { CenterComponent } from './components/center/center.component';
import { RemoveMinusSignPipe } from './pipes/remove-minus-sign.pipe';
import { SortByPipe } from './pipes/sort-by.pipe';

@NgModule({
    declarations: [
        CenterComponent,
        RemoveMinusSignPipe,
        SortByPipe
    ],
    imports: [
        IonicModule,
        CommonModule,
        RouterModule
    ],
    exports: [
        CenterComponent,
        RemoveMinusSignPipe,
        SortByPipe
    ]
})
export class SharedModule { }