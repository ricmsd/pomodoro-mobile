import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { Gesture, ViewDidLeave, ViewWillEnter, createGesture } from '@ionic/angular';
import { StatusBar } from '@capacitor/status-bar';
import { Haptics } from '@capacitor/haptics';
import * as echarts from 'echarts';

const GaugeColor = {
  TomatoRed: '#ea5548',
  Green: '#22c55e',
  Axis: '#555',
} as const;

@Component({
  selector: 'app-pomodoro',
  templateUrl: './pomodoro.page.html',
  styleUrls: ['./pomodoro.page.scss'],
})
export class PomodoroPage implements OnInit, ViewWillEnter, ViewDidLeave {
  @ViewChild('echarts') echartsElementRef?: ElementRef<HTMLElement>;

  public chart?: echarts.ECharts;
  public startTime: number = Date.now();
  public color: string = GaugeColor.TomatoRed;

  private tapGesture?: Gesture;

  public isEnd: boolean = false;
  public paused: boolean = false;
  public pausedTime?: number;

  constructor() {
  }

  async ngOnInit() {
    try {
      // only for mobile. www ver. throw exception :-(
      await StatusBar.setOverlaysWebView({ overlay: true });
      await StatusBar.hide();
    } catch (e) {
      console.log(e);
    }
  }

  ionViewWillEnter(): void {
    this.reset();
    this.createChart();
    this.enableGestures();
    this.startIntervalUpdateProgressData();
  }

  ionViewDidLeave(): void {
    this.stopIntervalUpdateProgressData();
    this.destroyGestures();
    this.destroyChart();
  }

  private reset(): void {
    // this.startTime = Date.now() - 60 * 29 * 1000; // for debug
    this.startTime = Date.now();
    this.color = GaugeColor.TomatoRed;
    this.isEnd = false;
    this.paused = false;
    this.pausedTime = undefined;
  }

  @HostListener('window:resize', ['$event'])
  public onResizeWindow(event: Event): void {
    // resize() is not called. Instead, CSS and SVG are used to scale the image to fit the Windows size.
    // this.chart?.resize();
  }

  private createChart(): void {
    this.chart = echarts.init(this.echartsElementRef?.nativeElement, null, {
      renderer: 'svg',
      width: 384,
      height: 384,
    });
    this.chart.setOption({
      series: [
        {
          name: 'minute',
          type: 'gauge',
          zlevel: 0,
          min: 0,
          max: 30,
          splitNumber: 6,
          silent: true,
          pointer: {
            show: false
          },
          progress: {
            show: false
          },
          axisLine: {
            lineStyle: {
              width: 50
            },
            roundCap: true
          },
          axisLabel: {
            show: false,
          },
          axisTick: {
            show: false,
          },
          splitLine: {
            show: false,
          },
          anchor: {
            show: true,
            showAbove: true,
            size: 50,
            itemStyle: {
              color: this.color
            }
          },
          title: {
            show: false
          },
          detail: {
            valueAnimation: true,
            offsetCenter: ['6%', '70%'],
            formatter: function(value: number) {
              return `{value|${value}}{unit|min}`;
            },
            rich: {
              value: {
                fontSize: 32,
                color: 'var(--data-color)'
              },
              unit: {
                fontSize: 14,
                color: 'var(--data-color)',
                padding: [0, 0, -8, 4]
              }
            }
          },
          data: [
            {
              value: 0
            }
          ]
        },
        {
          name: 'second',
          type: 'gauge',
          zlevel: 1,
          min: 0,
          max: 30 * 60,
          splitNumber: 6,
          silent: true,
          itemStyle: {
            color: this.color
          },
          pointer: {
            show: true,
            width: 12
          },
          progress: {
            show: true,
            width: 50,
            roundCap: true
          },
          axisLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          axisLabel: {
            show: false
          },
          splitLine: {
            show: false,
          },
          title: {
            show: false
          },
          detail: {
            show: false,
          },
          data: [
            {
              value: 0
            }
          ]
        },
        {
          name: 'tick-on-progress',
          type: 'gauge',
          zlevel: 2,
          min: 0,
          max: 30,
          splitNumber: 6,
          silent: true,
          itemStyle: {
            color: this.color
          },
          pointer: {
            show: false
          },
          progress: {
            show: false,
          },
          axisLine: {
            show: false
          },
          axisTick: {
            show: true,
            distance: -8,
            lineStyle: {
              color: GaugeColor.Axis,
              width: 1,
              cap: 'round'
            }
          },
          axisLabel: {
            show: true,
            color: GaugeColor.Axis,
            fontSize: 14
          },
          splitLine: {
            show: true,
            length: 15,
            distance: -8,
            lineStyle: {
              color: GaugeColor.Axis,
              width: 2,
              cap: 'round'
            }
          },
          title: {
            show: false
          },
          detail: {
            show: false,
          },
          data: [
            {
              value: 0
            }
          ]
        }
      ]
    });

    // resize automatically.
    const svgWrapperDiv = <HTMLDivElement>this.chart?.getDom().querySelector('div');
    svgWrapperDiv.style.width = '100%';
    svgWrapperDiv.style.height = '100%';
    const svg = <SVGElement>this.chart?.getDom().querySelector('svg');
    svg.setAttribute('viewBox', '0 0 384 384');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
  }

  private destroyChart(): void {
    if (!this.chart) {
      return;
    }
    echarts.dispose(this.chart);
  }

  private intervalUpdateProgressDataId?: any;
  private startIntervalUpdateProgressData(): void {
    if (this.intervalUpdateProgressDataId) {
      // already started.
      return;
    }
    this.intervalUpdateProgressDataId = setInterval(() => {
      this.updateProgressData();
    }, 1000);
  }

  private stopIntervalUpdateProgressData(): void {
    if (this.intervalUpdateProgressDataId) {
      clearInterval(this.intervalUpdateProgressDataId);
      this.intervalUpdateProgressDataId = undefined;
    }
  }

  private updateProgressData(): void {
    let second = (Date.now() - this.startTime) / 1000;
    if (second >= 60 * 30) {
      second = 60 * 30;
      this.isEnd = true;
      this.stopIntervalUpdateProgressData();
    }
    if (second > 60 * 25) {
      this.color = GaugeColor.Green;
    }
    this.chart?.setOption({
      series: [
        {
          name: 'minute',
          anchor: {
            itemStyle: { color: this.color },
          },
          data: [{ value: Math.floor(second / 60) }]
        },
        {
          name: 'second',
          itemStyle: { color: this.color },
          data: [{ value: second }]
        }
      ]
    });
    // console.log(`updateProgressData: second=${second}`)
  }

  private enableGestures(): void {
    let longTapTimerId: any;
    this.tapGesture = createGesture({
      el: <HTMLElement>this.echartsElementRef?.nativeElement,
      gestureName: 'tap',
      threshold: 0,
      onStart: () => {
        longTapTimerId = setTimeout(() => {
          longTapTimerId = undefined;
          this.onLongTap();
        }, 2000);
      },
      onEnd: () => {
        if (longTapTimerId) {
          clearTimeout(longTapTimerId);
          this.onTap();
        }
      }
    });
    this.tapGesture.enable();
  }

  private destroyGestures(): void {
    this.tapGesture?.destroy();
  }

  private onLongTap(): void {
    Haptics.vibrate().then(() => {
      this.reset();
      this.startIntervalUpdateProgressData();
    });
  }

  private onTap(): void {
    if (this.isEnd) {
      this.reset();
      this.startIntervalUpdateProgressData();
      return;
    }

    if (this.paused) {
      this.startTime += Date.now() - <number>this.pausedTime;
      this.pausedTime = undefined;
      this.startIntervalUpdateProgressData();
    } else {
      this.pausedTime = Date.now();
      this.stopIntervalUpdateProgressData();
    }
    this.paused = !this.paused;
  }
}
