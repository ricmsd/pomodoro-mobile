import { Component, ElementRef, NgZone, OnInit, ViewChild } from '@angular/core';
import { Gesture, ViewDidLeave, ViewWillEnter, createGesture } from '@ionic/angular';
import { StatusBar } from '@capacitor/status-bar';
import { Haptics } from '@capacitor/haptics';
import { KeepAwake } from '@capacitor-community/keep-awake';
import { Storage } from '@ionic/storage-angular';
import { Second } from './gauge.component';

const StorageKey = {
  Settings: <string>'settings-0.0.1'
} as const;

interface Settings {
  vibrate: {
    min25: boolean;
    min30: boolean;
    longTap: boolean;
  }
}

@Component({
  selector: 'app-pomodoro',
  templateUrl: './pomodoro.page.html',
  styleUrls: ['./pomodoro.page.scss']
})
export class PomodoroPage implements OnInit, ViewWillEnter, ViewDidLeave {
  @ViewChild('gaugeWrapper') gaugeWrapperRef?: ElementRef<HTMLElement>;

  public startTime: number = Date.now();
  public second = Second.Zero;
  private previousSecond = Second.Zero;
  public isEnd: boolean = false;
  public paused: boolean = false;
  public pausedTime?: number;
  private intervalUpdateSecondId?: any;

  private tapGesture?: Gesture;

  public settings: Settings = {
    // default settings
    vibrate: {
      min25: true,
      min30: true,
      longTap: true
    }
  };

  constructor(
    private storage: Storage,
    private ngZone: NgZone) {
  }

  async ngOnInit() {
    try {
      // only for mobile. www ver. throw exception :-(
      await StatusBar.setOverlaysWebView({ overlay: true });
      await StatusBar.hide();
    } catch (e) {
      console.log(e);
    }

    await this.storage.create();
    await this.loadSettings();
  }

  async ionViewWillEnter() {
    if ((await KeepAwake.isSupported()).isSupported) {
      await KeepAwake.keepAwake();
    }
    this.reset();
    this.enableGestures();
    this.startIntervalUpdateSecond();
  }

  async ionViewDidLeave() {
    this.stopIntervalUpdateSecond();
    this.destroyGestures();
    if ((await KeepAwake.isKeptAwake()).isKeptAwake) {
      await KeepAwake.allowSleep();
    }
  }

  private reset(): void {
    // this.startTime = Date.now() - 60 * 24 * 1000; // for debug
    this.startTime = Date.now();
    this.second = Second.Zero;
    this.isEnd = false;
    this.paused = false;
    this.pausedTime = undefined;
  }

  private startIntervalUpdateSecond(): void {
    if (this.intervalUpdateSecondId) {
      // already started.
      return;
    }
    this.intervalUpdateSecondId = setInterval(() => {
      this.updateSecond();
    }, 1000);
  }

  private stopIntervalUpdateSecond(): void {
    if (this.intervalUpdateSecondId) {
      clearInterval(this.intervalUpdateSecondId);
      this.intervalUpdateSecondId = undefined;
    }
  }

  private updateSecond(): void {
    this.second = Math.min(Math.floor((Date.now() - this.startTime) / 1000), Second.Minutes30);
    if (this.second === Second.Minutes30) {
      if (this.settings.vibrate.min30) {
        this.vibrate();
      }
      this.isEnd = true;
      this.stopIntervalUpdateSecond();
    }
    if (this.previousSecond < Second.Minutes25 && this.second >= Second.Minutes25) {
      if (this.settings.vibrate.min25) {
        this.vibrate();
      }
    }
    this.previousSecond = this.second;
  }

  private enableGestures(): void {
    const longTapThreshold = 2000;
    let longTapTimerId: any;
    // Since the Gesture callback is outside of Angular, use ngZone.run().
    this.tapGesture = createGesture({
      el: <HTMLElement>this.gaugeWrapperRef?.nativeElement,
      gestureName: 'tap',
      threshold: 0,
      onStart: () => this.ngZone.run(() => {
        longTapTimerId = setTimeout(() => {
          longTapTimerId = undefined;
          this.onLongTap();
        }, longTapThreshold);
      }),
      onEnd: () => this.ngZone.run(() => {
        if (longTapTimerId) {
          clearTimeout(longTapTimerId);
          this.onTap();
        }
      })
    });
    this.tapGesture.enable();
  }

  private destroyGestures(): void {
    this.tapGesture?.destroy();
  }

  private onLongTap(): void {
    const callback = () => {
      this.reset();
      this.startIntervalUpdateSecond();
    };
    if (this.settings.vibrate.longTap) {
      this.vibrate(callback);
    } else {
      callback();
    }
  }

  private vibrate(callback: () => void = () => {}): void {
    Haptics.vibrate()
      .catch((e) => {
        // When do it fail?
        console.log(e);
      })
      .finally(() => {
        callback();
      });
  }

  private onTap(): void {
    if (this.isEnd) {
      this.reset();
      this.startIntervalUpdateSecond();
      return;
    }

    if (this.paused) {
      this.startTime += Date.now() - <number>this.pausedTime;
      this.pausedTime = undefined;
      this.startIntervalUpdateSecond();
    } else {
      this.pausedTime = Date.now();
      this.stopIntervalUpdateSecond();
    }
    this.paused = !this.paused;
  }

  public async saveSettings(): Promise<void> {
    await this.storage.set(StorageKey.Settings, this.settings);
  }

  private async loadSettings(): Promise<void> {
    const settings = <Settings>await this.storage.get(StorageKey.Settings);
    if (!!settings) {
      this.settings = settings;
    }
  }
}
