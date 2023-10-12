import { Component, Input } from "@angular/core";

@Component({
  selector: 'app-license-modal',
  templateUrl: './license.modal.html',
  styleUrls: ['./license.modal.scss'],
})
export class LicenseModal {
  @Input() trigger?: string;
}
