import React from "react";
import { Modal, Input, ColorPicker, Form, ColorPickerProps} from "antd";
import { useTask } from "@/hooks/useTask";
import { useAuth } from "@/hooks/useAuth";
import { Project } from "../../../../shared";
import ProjectService from "@/services/projectService";
import TagService from "@/services/tagService";

interface CreateProjectModalProps {
  modalName: string;
  open: boolean;
  onOk: () => void;
  onClose: () => void;
}

export const CreateModal:React.FC<CreateProjectModalProps> = (props) => { 
    const { modalName, open, onOk, onClose } = props;
    const { userProjects, userTags, setUserProjects, setUserTags} = useTask();
    const { user } = useAuth();
    const [form] = Form.useForm();

    const handleCreate = async() => { 
      const values = await form.validateFields();
      
      try {
        if(modalName === '添加清单') {
          if(user) values.createby = user.id;
           const response = await ProjectService.create(values);
          if(response.data) {
            setUserProjects([...userProjects, response.data]);
          }

        } else {
          if(user) values.id = user.id;
          const response = await TagService.create(values);
          if(response.data) {
            setUserTags([...userTags, response.data]);
          }
        }
        
       
        onOk();
        
        // 重置表单
        form.resetFields();
      } catch (error) {
        console.error('创建项目失败:', error);
      }
    };
    
    // 处理颜色变化
    const onColorChange: ColorPickerProps['onChange'] = (value) => {
      // 颜色值会自动转换为十六进制字符串
      form.setFieldsValue({ color: value.toHexString() });
    };
    
    return (
    <Modal
      title={modalName}
      okText="添加"
      cancelText="取消"
      centered
      onOk={handleCreate}
      onCancel={onClose}
      open={open}
    >
      <Form
        form={form}
        layout="vertical"
        autoComplete="off"
        initialValues={{ color: '#1677ff' }}
      >
        <Form.Item
          name="name"
          label="名称"
          rules={[
            { required: true, message: '请输入名称' },
          ]}
        >
          <Input placeholder="请输入名称" />
        </Form.Item>
        
        <Form.Item
          name="color"
          label="颜色"
          rules={[{ required: true, message: '请选择颜色' }]}
        >
          <ColorPicker 
            showText 
            allowClear 
            onChange={onColorChange}
            presets={[
              {
                label: '推荐',
                colors: [
                  '#1677ff',
                  '#52c41a',
                  '#faad14',
                  '#ff4d4f',
                  '#722ed1',
                  '#fa8c16',
                  '#13c2c2',
                ],
              },
            ]}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};