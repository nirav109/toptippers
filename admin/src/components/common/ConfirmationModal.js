import { Modal, Button } from 'antd';

const { confirm } = Modal;

function ShowConfirm() {
  confirm({
    title: 'Do you want to delete these items?',
    content: 'When clicked the OK button, this dialog will be closed after 1 second',
    onOk() {
      alert('ok')
    },
    onCancel() {alert('cancel')},
  });
}

export default ShowConfirm;