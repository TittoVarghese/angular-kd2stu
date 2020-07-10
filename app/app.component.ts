import { Component, OnInit, ViewChild, Renderer2 } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { ProductsService } from './products.service';
import { AddEvent, GridComponent, CellClickEvent } from '@progress/kendo-angular-grid';
import { groupBy, GroupDescriptor } from '@progress/kendo-data-query';



const hasClass = (el, className) => new RegExp(className).test(el.className);

const isChildOf = (el, className) => {
    while (el && el.parentElement) {
        if (hasClass(el.parentElement, className)) {
            return true;
        }
        el = el.parentElement;
    }
    return false;
};

@Component({
    selector: 'my-app',
    template: `
        <kendo-grid
             (cellClick)="cellClickHandler($event)" 
            [data]="view"
            height="500"
        >
            <ng-template kendoGridToolbarTemplate>
                <button *ngIf="isInEditingMode"
                    (click)="cancelHandler()"
                    class="k-button k-primary">Cancel</button>
            </ng-template>
            <kendo-grid-column field="ProductName" title="Product Name"></kendo-grid-column>
            <kendo-grid-column-group   #groupColumn title= "Unit Details"> 
              <kendo-grid-column field="Units.UnitPrice" editor="numeric" title="Price"></kendo-grid-column>
              <kendo-grid-column field="Units.UnitsInStock" editor="numeric" title="Units In Stock"></kendo-grid-column>
            </kendo-grid-column-group>        
        </kendo-grid>
    `
})
export class AppComponent implements OnInit {
    public formGroup: FormGroup;
    public groups: GroupDescriptor[] = [];
    public view: any[];
    @ViewChild(GridComponent) private grid: GridComponent;
    private editedRowIndex: number;
    private isNew = false;

    public get isInEditingMode(): boolean {
        return this.editedRowIndex !== undefined || this.isNew;
    }

    public groupChange(groups: GroupDescriptor[]): void {
        this.groups = groups;
        this.view = groupBy(this.service.products(), this.groups);
    }

    constructor(private service: ProductsService, private renderer: Renderer2,private formBuilder: FormBuilder) { }

    public ngOnInit(): void {
      this.view = this.service.products();
      this.renderer.listen(
          "document",
          "click",
          ({ target }) => {
              if (!isChildOf(target, "k-grid")) {
                  this.saveClick();
              }
          });
    }

  
  public createFormGroup(dataItem: any): FormGroup {
    this.formGroup =  this.formBuilder.group({
      'ProductID': dataItem.ProductID,
      'ProductName': dataItem.ProductName,
      'Units': {'UnitPrice': dataItem.Units.UnitPrice, 'UnitsInStock': dataItem.Units.UnitsInStock}
      });
    return this.formGroup;
  }
  
   public cellClickHandler({ sender, rowIndex, columnIndex, dataItem, isEdited }) {
    if (!isEdited) {
      sender.editCell(rowIndex, columnIndex, this.createFormGroup(dataItem));
    }
   }

    public cancelHandler(): void {
       
    }

     
}
