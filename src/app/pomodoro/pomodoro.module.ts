import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PomodoroPageRoutingModule } from './pomodoro-routing.module';

import { PomodoroPage } from './pomodoro.page';
import { LicenseModal } from './license.modal';
import { GaugeComponent } from './gauge.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PomodoroPageRoutingModule
  ],
  declarations: [
    PomodoroPage,
    LicenseModal,
    GaugeComponent
  ]
})
export class PomodoroPageModule {}
