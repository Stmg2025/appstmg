import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Typography, message, Spin, Select } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import tecnicoService from '../../services/tecnicoService';

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const TecnicoEdit = () => {
    const { id } = useParams();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const navigate = useNavigate();
    const [tecnico, setTecnico] = useState(null);

    // Cargar datos del técnico
    useEffect(() => {
        const fetchData = async () => {
            try {
                setInitialLoading(true);
                const response = await tecnicoService.getTecnicoById(id);

                if (response.data && response.data.success) {
                    const tecnicoData = response.data.tecnico;
                    setTecnico(tecnicoData);

                    // Inicializar el formulario solo con los campos editables
                    form.setFieldsValue({
                        tipo_tecnico: tecnicoData.tipo_tecnico,
                        especialidad: tecnicoData.especialidad
                    });
                } else {
                    message.error('No se pudieron cargar los datos del técnico');
                }
            } catch (error) {
                console.error('Error al cargar técnico:', error);
                message.error('Error al cargar los datos del técnico');
            } finally {
                setInitialLoading(false);
            }
        };

        fetchData();
    }, [id, form]);

    const onFinish = async (values) => {
        try {
            setLoading(true);
            const response = await tecnicoService.updateTecnico(id, values);

            if (response.data && response.data.success) {
                message.success('Técnico actualizado exitosamente');
                navigate(`/tecnicos/${id}`);
            } else {
                message.error('Error al actualizar el técnico');
            }
        } catch (error) {
            console.error('Error al actualizar técnico:', error);
            message.error('Error al actualizar el técnico');
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) {
        return <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" /></div>;
    }

    if (!tecnico) {
        return (
            <div>
                <Title level={3}>Técnico no encontrado</Title>
                <Button type="primary" onClick={() => navigate('/tecnicos')}>
                    Volver a la lista
                </Button>
            </div>
        );
    }

    return (
        <div>
            <Title level={2}>Editar Técnico</Title>
            <div style={{ marginBottom: 16 }}>
                <strong>Nombre:</strong> {tecnico.nombre_completo}
            </div>

            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                style={{ maxWidth: 600 }}
            >
                <Form.Item
                    name="tipo_tecnico"
                    label="Tipo de Técnico"
                    rules={[{ required: true, message: 'Por favor selecciona el tipo de técnico' }]}
                >
                    <Select placeholder="Selecciona el tipo de técnico">
                        <Option value="Interno">Interno</Option>
                        <Option value="Externo">Externo</Option>
                    </Select>
                </Form.Item>

                <Form.Item
                    name="especialidad"
                    label="Especialidad"
                    rules={[{ required: true, message: 'Por favor selecciona la especialidad' }]}
                >
                    <Select placeholder="Selecciona la especialidad">
                        <Option value="Electromecanico">Electromecanico</Option>
                        <Option value="Gas">Gas</Option>
                        <Option value="Refrigeracion">Refrigeracion</Option>
                    </Select>
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading}>
                        Actualizar Técnico
                    </Button>
                    <Button
                        style={{ marginLeft: 8 }}
                        onClick={() => navigate(`/tecnicos/${id}`)}
                    >
                        Cancelar
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
};

export default TecnicoEdit;