import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { Gesture, ViewDidLeave, ViewWillEnter, createGesture } from '@ionic/angular';
import { StatusBar } from '@capacitor/status-bar';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import * as echarts from 'echarts';

@Component({
  selector: 'app-pomodoro',
  templateUrl: './pomodoro.page.html',
  styleUrls: ['./pomodoro.page.scss'],
})
export class PomodoroPage implements OnInit, ViewWillEnter, ViewDidLeave {
  @ViewChild('echarts') echartsElementRef?: ElementRef<HTMLElement>;

  public chart?: echarts.ECharts;
  public startTime: number = Date.now();
  public color = '#ea5548'; // Tomato Red!

  private longTapGesture?: Gesture;

  constructor() {
  }

  ngOnInit() {
    console.log('ngOnInit');
    StatusBar.setOverlaysWebView({ overlay: true });
    StatusBar.hide();
  }

  ionViewWillEnter(): void {
    this.reset();
    this.createChart();
    this.enableGestures();
  }

  ionViewDidLeave(): void {
    this.destroyGestures();
  }

  private reset(): void {
    this.startTime = Date.now();
    this.color = '#ea5548';
  }

  @HostListener('window:resize', ['$event'])
  public onResizeWindow(event: Event): void {
    this.chart?.resize();
  }

  private createChart(): void {
    this.chart = echarts.init(this.echartsElementRef?.nativeElement, null, {
      renderer: 'svg'
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
            distance: 25,
            color: '#999',
            fontSize: 16
          },
          axisTick: {
            show: false,
            distance: -30,
            length: 8,
            lineStyle: {
              color: '#999',
              width: 2
            }
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
              color: '#555',
              width: 2,
              cap: 'round'
            }
          },
          axisLabel: {
            show: true,
            color: '#555',
            fontSize: 14
          },
          splitLine: {
            show: true,
            length: 15,
            distance: -8,
            lineStyle: {
              color: '#555',
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

    setInterval(() => {
      let second = (Date.now() - this.startTime) / 1000;
      if (second > 60 * 30) {
        second = 60 * 30;
      }
      if (second > 60 * 25) {
        this.color = '#22c55e';
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
    }, 1000);
  }

  private enableGestures(): void {
    let longTapTimerId: any;
    this.longTapGesture = createGesture({
      el: <HTMLElement>this.echartsElementRef?.nativeElement,
      gestureName: 'long-tap',
      threshold: 0,
      onStart: () => {
        longTapTimerId = setTimeout(() => {
          this.onLongTap();
        }, 2000);
      },
      onEnd: () => {
        clearTimeout(longTapTimerId);
      }
    });
    this.longTapGesture.enable();
  }

  private destroyGestures(): void {
    this.longTapGesture?.destroy();
  }

  private onLongTap(): void {
    Haptics.vibrate().then(() => {
      this.reset();
    });
  }
}
