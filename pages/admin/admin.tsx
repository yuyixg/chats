import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import React from 'react';
import ReactECharts from 'echarts-for-react';
import { Card, CardBody, CardHeader } from '@nextui-org/react';
import { connection } from '@/models';

interface Props {}

const Admin = (props: any) => {
  const option1 = {
    tooltip: {
      trigger: 'axis',
    },
    legend: {
      data: ['GPT3.5', 'GPT4', 'GPT4-Vision'],
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: [
      {
        type: 'category',
        boundaryGap: false,
        data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
      },
    ],
    yAxis: [
      {
        type: 'value',
      },
    ],
    series: [
      {
        name: 'GPT3.5',
        type: 'line',
        stack: '总量',
        areaStyle: { normal: {} },
        data: [120, 132, 101, 134, 90, 230, 210],
      },
      {
        name: 'GPT4',
        type: 'line',
        stack: '总量',
        areaStyle: { normal: {} },
        data: [220, 182, 191, 234, 290, 330, 310],
      },
      {
        name: 'GPT4-Vision',
        type: 'line',
        stack: '总量',
        areaStyle: { normal: {} },
        data: [150, 232, 201, 154, 190, 330, 410],
      },
    ],
  };
  const option2 = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b} : {c} ({d}%)',
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      data: ['GPT3.5', 'GPT4', 'GPT-Vision', '通义千问', '文心一言'],
    },
    series: [
      {
        name: '访问来源',
        type: 'pie',
        radius: '55%',
        data: [
          { value: 1548, name: 'GPT3.5' },
          { value: 310, name: 'GPT4' },
          { value: 234, name: 'GPT-Vision' },
          { value: 135, name: '通义千问' },
          { value: 335, name: '文心一言' },
        ],
        itemStyle: {
          emphasis: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
      },
    ],
  };

  return (
    <>
      <div className='flex flex-wrap gap-4'>
        <Card shadow='none' className='w-1/3 border-solid border-1'>
          <CardHeader className='pb-0 pt-2 px-4 flex-col items-start font-semibold'>
            消耗Tokens
          </CardHeader>
          <CardBody>
            <ReactECharts option={option1} />
          </CardBody>
        </Card>
        <Card shadow='none' className='w-1/3 border-solid border-1'>
          <CardHeader className='pb-0 pt-2 px-4 flex-col items-start font-semibold'>
            使用次数
          </CardHeader>
          <CardBody>
            <ReactECharts option={option2} />
          </CardBody>
        </Card>
      </div>
    </>
  );
};

export default Admin;

export const getServerSideProps = async ({ locale }: any) => {
  // try {
  //   await connection.authenticate();
  //   await connection.sync({ force: true });
  // } catch (error) {
  //   console.log(error);
  // }
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', ['common', 'admin'])),
    },
  };
};
