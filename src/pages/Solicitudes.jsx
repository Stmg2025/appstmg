import React, { useEffect, useState, useContext } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const { Option } = Select;

const Solicitudes = () => {
    const { user } = useContext(AuthContext);
    const [solicitudes, setSolicitudes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedSolicitud, setSelectedSolicitud] = useState(null);
    const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10 });
    const [search, setSearch] = useState('');
    const [form] = Form.useForm();

    // Verifica si el usuario es técnico
    const esTecnico = user?.user?.cargo.trim() === 'Técnico';

    useEffect(() => {
        cargarSolicitudes();
    }, [pagination.page, search]);

    const cargarSolicitudes = async () => {
        setLoading(true);
        try {
            const response = await axios.get('https://stmg.cl/node-server/api/solicitudes', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                params: {
                    page: pagination.page,
                    limit: pagination.limit,
                    search
                }
            });

            // 📌 Verificar si la API devuelve un array válido
            if (Array.isArray(response.data.solicitudes)) {
                const datosOrdenados = response.data.solicitudes.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
                setSolicitudes(datosOrdenados);
                setPagination(prev => ({
                    ...prev,
                    total: response.data.pagination?.total || response.data.solicitudes.length
                }));
            } else {
                setSolicitudes([]);
            }
        } catch (error) {
            console.error("Error cargando solicitudes:", error);
            message.error("No se pudieron cargar las solicitudes.");
        } finally {
            setLoading(false);
        }
    };

    const mostrarModal = (solicitud = null) => {
        setSelectedSolicitud(solicitud);
        form.setFieldsValue(solicitud || {});
        setModalOpen(true);
    };

    const manejarEnvio = async (values) => {
        setLoading(true);
        try {
            if (selectedSolicitud) {
                await axios.put(`https://stmg.cl/node-server/api/solicitudes/${selectedSolicitud.id}`, values, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                message.success("Solicitud actualizada con éxito.");
            } else {
                await axios.post('https://stmg.cl/node-server/api/solicitudes', values, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                message.success("Solicitud creada con éxito.");
            }
            setModalOpen(false);
            cargarSolicitudes();
        } catch (error) {
            console.error("Error guardando la solicitud:", error);
            message.error("No se pudo guardar la solicitud.");
        } finally {
            setLoading(false);
        }
    };

    const manejarEliminar = async (id) => {
        setLoading(true);
        try {
            await axios.delete(`https://stmg.cl/node-server/api/solicitudes/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            message.success("Solicitud eliminada.");
            cargarSolicitudes();
        } catch (error) {
            console.error("Error eliminando la solicitud:", error);
            message.error("No se pudo eliminar la solicitud.");
        } finally {
            setLoading(false);
        }
    };

    const columnas = [
        { title: 'ID', dataIndex: 'id', key: 'id', sorter: (a, b) => b.id - a.id },
        { title: 'Código Auxiliar', dataIndex: 'codaux', key: 'codaux' },
        { title: 'Nombre Auxiliar', dataIndex: 'nomaux', key: 'nomaux' },
        { title: 'Tipo', dataIndex: 'tipo', key: 'tipo' },
        {
            title: 'Estado', dataIndex: 'estado', key: 'estado', filters: [
                { text: 'Pendiente', value: 'pendiente' },
                { text: 'En proceso', value: 'en proceso' },
                { text: 'Completado', value: 'completado' }
            ], onFilter: (value, record) => record.estado === value
        },
        { title: 'Creada Por', dataIndex: 'creada_por', key: 'creada_por' },
        {
            title: 'Fecha Creación',
            dataIndex: 'fecha',
            key: 'fecha',
            sorter: (a, b) => new Date(b.fecha) - new Date(a.fecha),
            defaultSortOrder: 'descend' // 📌 Ordena las más recientes primero
        },
        {
            title: 'Acciones',
            key: 'acciones',
            render: (_, record) => (
                <>
                    {!esTecnico && (
                        <>
                            <Button
                                icon={<EditOutlined />}
                                style={{ marginRight: 8 }}
                                onClick={() => mostrarModal(record)}
                            />
                            <Popconfirm
                                title="¿Eliminar solicitud?"
                                onConfirm={() => manejarEliminar(record.id)}
                                okText="Sí"
                                cancelText="No"
                            >
                                <Button icon={<DeleteOutlined />} danger />
                            </Popconfirm>
                        </>
                    )}
                </>
            )
        }
    ];

    return (
        <div style={{ padding: 20 }}>
            <h1>Gestión de Solicitudes</h1>

            <Input
                placeholder="Buscar solicitud..."
                prefix={<SearchOutlined />}
                onChange={(e) => setSearch(e.target.value)}
                allowClear
                style={{ marginBottom: 16, width: 300 }}
            />

            <Table
                columns={columnas}
                dataSource={solicitudes}
                loading={loading}
                rowKey="id"
                pagination={{
                    current: pagination.page,
                    total: pagination.total,
                    pageSize: pagination.limit,
                    onChange: (page) => setPagination(prev => ({ ...prev, page })),
                }}
                style={{ marginTop: 20 }}
            />

            <Modal
                title={selectedSolicitud ? "Editar Solicitud" : "Nueva Solicitud"}
                open={modalOpen}
                onCancel={() => setModalOpen(false)}
                onOk={() => form.submit()}
                confirmLoading={loading}
            >
                <Form form={form} layout="vertical" onFinish={manejarEnvio}>
                    <Form.Item name="titulo" label="Título" rules={[{ required: true, message: "Campo obligatorio" }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="descripcion" label="Descripción">
                        <Input.TextArea />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default Solicitudes;
