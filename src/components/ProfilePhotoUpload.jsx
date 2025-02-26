// src/components/ProfilePhotoUpload.jsx
import { useState } from 'react';
import { Upload, Button, message } from 'antd';
import { UploadOutlined, LoadingOutlined } from '@ant-design/icons';
import axios from 'axios';

const ProfilePhotoUpload = ({ onSuccess }) => {
    const [loading, setLoading] = useState(false);

    const beforeUpload = (file) => {
        // Verificar el tipo de archivo
        const isImage = file.type.startsWith('image/');
        if (!isImage) {
            message.error('Solo puedes subir archivos de imagen!');
            return Upload.LIST_IGNORE;
        }

        // Verificar el tamaño (2MB máximo)
        const isLessThan2MB = file.size / 1024 / 1024 < 2;
        if (!isLessThan2MB) {
            message.error('La imagen debe ser menor a 2MB!');
            return Upload.LIST_IGNORE;
        }

        return true;
    };

    const customUpload = async ({ file, onSuccess: onUploadSuccess, onError }) => {
        setLoading(true);

        const formData = new FormData();
        formData.append('image', file);

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                'https://stmg.cl/node-server/api/uploads/profile-image',
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            setLoading(false);
            onUploadSuccess();

            // Llamar a la función de éxito con la URL de la imagen
            if (response.data && response.data.imageUrl) {
                onSuccess(response.data.imageUrl);
                message.success('Imagen subida correctamente');
            }
        } catch (error) {
            setLoading(false);
            onError();

            // Mostrar mensaje de error
            const errorMsg = error.response?.data?.message || 'Error al subir la imagen';
            message.error(errorMsg);
        }
    };

    return (
        <Upload
            name="image"
            listType="picture"
            showUploadList={false}
            beforeUpload={beforeUpload}
            customRequest={customUpload}
        >
            <Button
                icon={loading ? <LoadingOutlined /> : <UploadOutlined />}
                loading={loading}
            >
                {loading ? 'Subiendo...' : 'Subir foto'}
            </Button>
        </Upload>
    );
};

export default ProfilePhotoUpload;