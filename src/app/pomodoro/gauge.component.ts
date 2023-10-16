import { AfterViewInit, Component, ElementRef, HostListener, Input, OnChanges, OnDestroy, SimpleChanges, ViewChild } from "@angular/core";
import * as echarts from 'echarts';

const GaugeColor = {
  TomatoRed: '#ea5548',
  Green: '#22c55e',
  Axis: '#555',
} as const;

export const Second = {
  Zero: <number>0,
  Minutes25: <number>(60 * 25),
  Minutes30: <number>(60 * 30),
} as const;
  
@Component({
  selector: 'app-gauge-component',
  templateUrl: './gauge.component.html',
  styleUrls: ['./gauge.component.scss']
})
export class GaugeComponent implements OnChanges, AfterViewInit, OnDestroy {
  @ViewChild('echarts') echartsElementRef?: ElementRef<HTMLElement>;

  private _second: number = Second.Zero;
  @Input() set second(value: number) {
    this._second = Math.min(value, Second.Minutes30);
  }
  get second(): number {
    return this._second;
  }

  @Input() paused: boolean = false;

  @Input() fancyColor: boolean = false;

  @Input() invertColor: boolean = false;

  /**
   * [[startTime, endTime], [startTime, endTime], ..., [startTime, endTime]]
   */
  @Input() history: number[][] = [];

  public chart?: echarts.ECharts;
  public color: string = GaugeColor.TomatoRed;

  private historyLeftMargin: number = 0;
  private historyData: number[][] = [];

  constructor() {
    for (let i = 0; i < 14; i++) {
      this.historyData.push([i, 0]);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['second'] || changes['fancyColor'] || changes['invertColor']) {
      this.updateColor();
      this.updateChart();
    }
    if (changes['history']) {
      this.updateHistory();
      this.updateChart();
    }
  }

  ngAfterViewInit(): void {
    this.updateColor();
    this.createChart();
  }

  ngOnDestroy(): void {
    this.destroyChart();
  }

  private getWorkColor(): string {
    return this.invertColor ? GaugeColor.Green : GaugeColor.TomatoRed;
  }

  private getShortBreakColor(): string {
    return this.invertColor ? GaugeColor.TomatoRed : GaugeColor.Green;
  }

  private updateColor(): void {
    if (this.second >= Second.Minutes25) {
      this.color = this.getShortBreakColor();
    } else {
      this.color = this.getWorkColor();
    }
  }

  private updateHistory(): void {
    // history
    // - big circle means 4 pomodoros.
    // - small circle means 1 pomodoro.
    // - max 12 big circle (4 pomodoros * 12 = 24 hours) per one day.
    // - max 14 circle point (4 pmodoros * 11 + 1 pomodoro * 3) per one day.
    // ex.) b b b s s s => 4 * 3 + 3 = 15 pomodoros.
    const bigCircle = Math.floor(this.history.length / 4);
    const smallCircle = this.history.length % 4;
    const historyPoint = bigCircle + smallCircle;
    const data = [];
    let point = 0;
    for (let i = 0; i < bigCircle; i++) {
      data.push([point++, 4]); // 4 = big circle
    }
    for (let i = 0; i < smallCircle; i++) {
      data.push([point++, 2]); // 2 = small circle
    }
    for (let i = 0; i < (14 - bigCircle - smallCircle); i++) {
      data.push([point++, 0]); // 0 = empty
    }
    this.historyData = data;
    console.log('updateHistory', data);

    // centering circles
    this.historyLeftMargin = (384 - 244) / 2 + (244 - (244 / 13) * (historyPoint - 1)) / 2;
  }

  private createChart(): void {
    this.chart = echarts.init(this.echartsElementRef?.nativeElement, null, {
      renderer: 'svg',
      width: 384,
      height: 384,
    });
    this.chart.setOption({
      singleAxis: {
        bottom: 0,
        left: this.historyLeftMargin,
        height: 84,
        width: 244,
        axisLine: {
          show: false,
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
        // 13 splitNumber = 14 axisTick (max is 11 big circle + 3 small circle)
        splitNumber: 13,
      },
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
            show: false,
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
          min: Second.Zero,
          max: Second.Minutes30,
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
            roundCap: true,
            itemStyle: {
              shadowBlur: this.fancyColor ? 15 : 0,
              shadowColor: this.color,
            }
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
              value: Second.Zero
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
          anchor: {
            show: true,
            showAbove: true,
            size: 50,
            itemStyle: {
              color: this.color
            }
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
        },
        {
          type: 'scatter',
          name: 'history',
          coordinateSystem: 'singleAxis',
          itemStyle: {
            color: 'rgb(230, 235, 248)',
            opacity: 1
          },
          symbolSize: (value: number[]) => {
            return value[1] * 4;
          },
          silent: true,
          data: this.historyData
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

  private updateChart(): void {
    if (!this.chart) {
      return;
    }
    this.chart.setOption({
      singleAxis: {
        left: this.historyLeftMargin,
      },
      series: [
        {
          name: 'minute',
          anchor: {
            itemStyle: {
              color: this.color
            },
          },
          data: [{
            value: Math.floor(this.second / 60)
          }]
        },
        {
          name: 'second',
          itemStyle: {
            color: this.color
          },
          progress: {
            show: true,
            width: 50,
            roundCap: true,
            itemStyle: {
              shadowBlur: this.fancyColor ? 15 : 0,
              shadowColor: this.color
            }
          },
          data: [{
            value: this.second
          }]
        },
        {
          name: 'tick-on-progress',
          itemStyle: {
            color: this.color
          },
          anchor: {
            show: true,
            showAbove: true,
            size: 50,
            itemStyle: {
              color: this.color
            }
          }
        },
        {
          name: 'history',
          data: this.historyData
        }
      ]
    });
  }

  @HostListener('window:resize', ['$event'])
  public onResizeWindow(event: Event): void {
    // resize() is not called. Instead, CSS and SVG are used to scale the image to fit the Windows size.
    // this.chart?.resize();
  }

}
