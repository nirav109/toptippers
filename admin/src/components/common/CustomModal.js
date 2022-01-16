import React from 'react';
import { Modal, Button } from 'antd';

function CustomModal(props) {
    const { visible, handleOk, handleCancel, title, backBtnText, submitBtnText, children } = props;
    return (<Modal
        visible={visible}
        title={title}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={[
            <Button key="back" onClick={handleCancel}>
                {backBtnText}
            </Button>,
            <Button key="submit" type="primary" onClick={handleOk}>
                {submitBtnText}
            </Button>]}>
        {children}
    </Modal>
    );
}
export default CustomModal;