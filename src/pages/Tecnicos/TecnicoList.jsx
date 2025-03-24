import React, { useState, useEffect } from 'react';
import { Table, Button, Space, message, Typography, Spin } from 'antd';
import { EyeOutlined, EditOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import tecnicoService from '../../services/tecnicoService';

const { Title } = Typography;

const TecnicoList = () => {
    const [tecnicos, setTecnicos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTecnicos();
    }, []);

    const fetchTecnicos = async () => {
        try {
            setLoading(true);
            const response = await tecnicoService.getTecnicos();

            console.log("✅ Técnicos obtenidos:", response.data);

            if (response.data.success) {
                setTecnicos(response.data.tecnicos);
            } else {
                throw new Error(response.data.message || "No se pudieron obtener los técnicos.");
            }
        } catch (error) {
            console.error('❌ Error al obtener técnicos:', error);
            message.error(error.message || "Error al cargar los técnicos");
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            sorter: (a, b) => a.id - b.id,
        },
        {
            title: 'Nombre',
            key: 'nombre',
            dataIndex: 'nombre_completo',
            sorter: (a, b) => (a.nombre_completo || '').localeCompare(b.nombre_completo || ''),
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            sorter: (a, b) => a.email.localeCompare(b.email),
        },
        {
            title: 'Teléfono',
            dataIndex: 'telefono',
            key: 'telefono',
        },
        {
            title: 'Tipo de Técnico',
            dataIndex: 'tipo_tecnico',
            key: 'tipo_tecnico',
            sorter: (a, b) => (a.tipo_tecnico || '').localeCompare(b.tipo_tecnico || ''),
        },
        {
            title: 'Especialidad',
            dataIndex: 'especialidad',
            key: 'especialidad',
            sorter: (a, b) => (a.especialidad || '').localeCompare(b.especialidad || ''),
        },

        {
            title: 'Acciones',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Link to={`/tecnicos/${record.id}`}>
                        <Button type="primary" icon={<EyeOutlined />} size="small">
                            Ver
                        </Button>
                    </Link>
                    <Link to={`/tecnicos/edit/${record.id}`}>
                        <Button type="default" icon={<EditOutlined />} size="small">
                            Editar
                        </Button>
                    </Link>
                </Space>
            ),
        },
    ];

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" /></div>;
    }

    return (
        <div>
            <Title level={2}>Lista de Técnicos</Title>
            <Table
                columns={columns}
                dataSource={tecnicos}
                rowKey="id"
                pagination={{ pageSize: 10 }}
            />
        </div>
    );
};

export default TecnicoList;