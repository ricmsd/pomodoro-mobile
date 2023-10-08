import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ViewWillEnter } from '@ionic/angular';
import * as echarts from 'echarts';

@Component({
  selector: 'app-pomodoro',
  templateUrl: './pomodoro.page.html',
  styleUrls: ['./pomodoro.page.scss'],
})
export class PomodoroPage implements OnInit, ViewWillEnter {
  @ViewChild('echarts') echartsElementRef?: ElementRef<HTMLElement>;

  public startTime: number = Date.now();
  public color = '#ea5548'; // Tomato Red!

  constructor() {
  }

  ngOnInit() {
  }

  ionViewWillEnter(): void {
    this.reset();

    const chart = echarts.init(this.echartsElementRef?.nativeElement);
    chart.setOption({
      series: [
        {
          name: 'minute',
          type: 'gauge',
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
              width: 18
            },
            roundCap: true
          },
          axisLabel: {
            distance: 25,
            color: '#999',
            fontSize: 16
          },
          anchor: {
            show: true,
            showAbove: true,
            size: 25,
            itemStyle: {
              color: this.color
            }
          },
          title: {
            show: false
          },
          detail: {
            valueAnimation: true,
            fontSize: 32,
            offsetCenter: [0, '70%']
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
          min: 0,
          max: 30 * 60,
          splitNumber: 6,
          itemStyle: {
            color: this.color
          },
          progress: {
            show: true,
            width: 18,
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
      chart.setOption({
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

  private reset(): void {
    this.startTime = Date.now();
    this.color = '#ea5548';
  }

  public onClickChart(): void {
    this.reset();
  }
}
