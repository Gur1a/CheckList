import useTask from "@/hooks/useTask";
import React, { useState } from 'react';
import { DatePicker, Button, Space, Form, Radio, Modal, TimePicker } from 'antd';
import type {TimePickerProps} from 'antd';
import { CalendarOutlined, ClockCircleOutlined, SyncOutlined } from '@ant-design/icons';
import type {Dayjs} from 'dayjs'
import { setDate } from "date-fns";
import { mergeDateAndTime } from "@/utils/generalFunction";
import { bottom } from "@popperjs/core";

interface TaskTimePickerProps {
   
    onConfirm: (dueDate: Date|null, startDate?: Date|null) => Promise<void>;
    onCancel: () => void;
}

const RangePicker = DatePicker;

export const TaskTimePicker: React.FC<TaskTimePickerProps> = ({ onConfirm, onCancel }) => {
    const [mode, setMode] = useState<'date' | 'range'>('date'); // 日期 or 时间段
    const [selectedStartDate, setSelectedStartDate] = useState<Date |null>(null);
    const [selectedDueDate, setSelectedDueDate] = useState<Date | null>(null);
    const [selectedStartTime, setSelectedStartTime] = useState<Dayjs | null>(null);
    const [selectedEndTime, setSelectedEndTime] = useState<Dayjs | null>(null);
    const [form] = Form.useForm();

    const handleConfirm = () => {
        if(mode === 'date'){
            onConfirm(mergeDateAndTime(selectedStartDate, selectedStartTime))
        } else {
            if(selectedStartDate && selectedDueDate && selectedStartTime && selectedEndTime)
            onConfirm(
                mergeDateAndTime(selectedDueDate, selectedEndTime),
                mergeDateAndTime(selectedStartDate, selectedStartTime), 
            )
        }
        onCancel()
    };

    const handleClear = () => {
        setSelectedStartDate(null);
        setSelectedDueDate(null);
        form.resetFields();
    };

    return (
        <Modal
            title="选择时间"
            open={true}
            onCancel={onCancel}
            footer={[
                <Button key="clear" onClick={handleClear}>
                    清除
                </Button>,
                <Button key="confirm" type="primary" onClick={handleConfirm}>
                    确定
                </Button>,
            ]}
            mask={false}
            width={400}
        >
            <div style={{ padding: '20px', textAlign: 'center' }}>
                {/* 切换模式 */}
                <Space style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                    <Button
                        type={mode === 'date' ? 'primary' : 'default'}
                        onClick={() => setMode('date')}
                        size="small"
                    >
                        日期
                    </Button>
                    <Button
                        type={mode === 'range' ? 'primary' : 'default'}
                        onClick={() => setMode('range')}
                        size="small"
                    >
                        时间段
                    </Button>
                </Space>

                {/* 日历组件 */}
                <div style={{ marginBottom: '20px' }}>
                    {mode === 'date' ? (
                        <DatePicker
                            value={selectedStartDate}
                            onChange={date => setSelectedStartDate(date)}
                            picker="date"
                            format="YYYY-MM-DD"
                            placeholder="选择日期"
                            style={{ width: '100%' }}
                            showToday
                            showNow
                            suffixIcon={<CalendarOutlined />}
                        />
                    ) : (
                        <>
                            <DatePicker
                                value={selectedStartDate}
                                onChange={date => setSelectedStartDate(date)}
                                picker="date"
                                format="YYYY-MM-DD"
                                placeholder="选择日期"
                                style={{ width: '100%', margin: '10px 0px'}}
                                showToday
                                showNow
                                suffixIcon={<CalendarOutlined />}
                            />
                            <DatePicker
                                value={selectedDueDate}
                                onChange={date => setSelectedDueDate(date)}
                                picker="date"
                                placeholder="选择日期"
                                format="YYYY-MM-DD"
                                style={{ width: '100%' }}
                                showToday
                                showNow
                                suffixIcon={<CalendarOutlined />}
                            />
                        </>
                       
                        
                    )}
                </div>

                {/* 时间设置 */}

                {mode === 'date' ?
                    (
                        <Form.Item label="开始" name="time">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <ClockCircleOutlined /> 
                            <span>→</span>
                            <TimePicker
                                value={selectedStartTime}
                                onChange= {time => setSelectedStartTime(time)} 
                                placeholder="选择时间"
                                minuteStep={15} hourStep={1} format={"HH:mm"}/>
                        </div>
                        </Form.Item>
                    )
                    :(
                        <>
                            <Form.Item label="解释" name="time">
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <ClockCircleOutlined /> 
                                    <span>→</span>
                                    <TimePicker
                                        value={selectedStartTime} 
                                        onChange= {time => setSelectedStartTime(time)}
                                        placeholder="选择时间" 
                                        minuteStep={15} hourStep={1} format={"HH:mm"}/>
                                </div>
                            </Form.Item>
                            <Form.Item label="时间" name="time">
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <ClockCircleOutlined /> 
                                    <span>→</span>
                                    <TimePicker 
                                        value={selectedEndTime} 
                                        onChange= {time => setSelectedEndTime(time)}
                                        placeholder="选择时间"
                                        minuteStep={15} hourStep={1} format={"HH:mm"}/>
                                </div>
                            </Form.Item>
                        </>

                    )
                

                }

                {/* 重复设置 */}
                <Form.Item label="重复" name="repeat">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <SyncOutlined />
                        <span>设置重复</span>
                        <span>→</span>
                    </div>
                </Form.Item>
            </div>
        </Modal>
    );
};

export default TaskTimePicker;