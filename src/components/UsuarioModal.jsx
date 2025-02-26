import { Modal, Form, Input, Select, DatePicker, Row, Col, message } from 'antd';
import { useEffect } from 'react';
import dayjs from 'dayjs';

const { Option } = Select;

const UsuarioModal = ({ visible, onClose, onSuccess, editingUser }) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (editingUser) {
            form.setFieldsValue({
                ...editingUser,
                fecha_nacimiento: editingUser.fecha_nacimiento ? dayjs(editingUser.fecha_nacimiento) : null,
                fecha_creacion: editingUser.fecha_creacion ? dayjs(editingUser.fecha_creacion) : dayjs()
            });
        } else {
            form.resetFields();
            form.setFieldsValue({
                estado: 'activo',
                fecha_creacion: dayjs()
            });
        }
    }, [editingUser, form]);

    const handleSubmit = async (values) => {
        const token = localStorage.getItem('token');
        const method = editingUser ? 'PUT' : 'POST';
        const url = editingUser
            ? `https://stmg.cl/node-server/api/usuarios/${editingUser.id}`
            : 'https://stmg.cl/node-server/api/usuarios';

        // Crear una copia de los valores del formulario
        const payload = {
            nombre: values.nombre,
            apellido: values.apellido,
            telefono: values.telefono,
            email: values.email,
            rut: values.rut,
            fecha_nacimiento: values.fecha_nacimiento ? values.fecha_nacimiento.format('YYYY-MM-DD') : null,
            cargo: values.cargo,
            estado: values.estado || 'activo',
            fecha_creacion: values.fecha_creacion ? values.fecha_creacion.format('YYYY-MM-DD HH:mm:ss') : dayjs().format('YYYY-MM-DD HH:mm:ss'),
        };

        // CORRECCIÓN: Solo incluir la contraseña si se proporciona y cambiar a "password"
        if (values.password && values.password.trim() !== '') {
            payload.password = values.password;
        }

        console.log("📤 Enviando datos al backend:", payload);

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (response.ok) {
                message.success(editingUser ? 'Usuario actualizado' : 'Usuario agregado');
                onClose();
                onSuccess();
            } else {
                message.error(`Error en la API: ${data.message || 'No se pudo procesar la solicitud'}`);
            }
        } catch (error) {
            message.error('Error en la conexión con el servidor');
        }
    };

    return (
        <Modal title={editingUser ? 'Editar Usuario' : 'Agregar Usuario'} open={visible} onCancel={onClose} onOk={() => form.submit()} width={600}>
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
                <Row gutter={16}>
                    <Col span={12}><Form.Item name="nombre" label="Nombre" rules={[{ required: true }]}><Input /></Form.Item></Col>
                    <Col span={12}><Form.Item name="apellido" label="Apellido" rules={[{ required: true }]}><Input /></Form.Item></Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}><Form.Item name="telefono" label="Teléfono" rules={[{ required: true }]}><Input /></Form.Item></Col>
                    <Col span={12}><Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}><Input /></Form.Item></Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}><Form.Item name="rut" label="RUT" rules={[{ required: true }]}><Input /></Form.Item></Col>
                    <Col span={12}><Form.Item name="cargo" label="Cargo" rules={[{ required: true }]}><Input /></Form.Item></Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}><Form.Item name="fecha_nacimiento" label="Fecha de Nacimiento" rules={[{ required: true }]}><DatePicker format="YYYY-MM-DD" /></Form.Item></Col>
                    <Col span={12}>
                        {/* CORRECCIÓN: Cambiar el nombre de password_hash a password */}
                        <Form.Item
                            name="password"
                            label="Contraseña"
                            rules={editingUser ? [] : [{ required: true, message: 'Debe ingresar una contraseña' }]}
                        >
                            <Input.Password placeholder={editingUser ? 'Dejar vacío para no cambiar' : 'Nueva contraseña'} />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}><Form.Item name="estado" label="Estado"><Select><Option value="activo">Activo</Option><Option value="inactivo">Inactivo</Option><Option value="suspendido">Suspendido</Option></Select></Form.Item></Col>
                    <Col span={12}><Form.Item name="fecha_creacion" label="Fecha de Creación"><DatePicker format="YYYY-MM-DD HH:mm:ss" showTime disabled /></Form.Item></Col>
                </Row>
            </Form>
        </Modal>
    );
};

export default UsuarioModal;