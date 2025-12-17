// screens/PerfilScreen.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  Alert, 
  Modal, 
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  Switch,
  TouchableOpacity
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { updateUser, changePassword } from '../api';
import { ScreenProps } from '../types';
import Button from '../components/Button';
import Loading from '../components/Loading';
import { styles as globalStyles } from '../styles/global';

const PerfilScreen: React.FC<ScreenProps<'Perfil'>> = ({}) => {
  const { user, updateUserContext } = useAuth();
  const [loading, setLoading] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  
  // Estados para editar perfil
  const [editNombre, setEditNombre] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRol, setEditRol] = useState<'estudiante' | 'profesor'>('estudiante');
  
  // Estados para cambiar contraseña
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Estados para secciones del formulario
  const [showChangePassword, setShowChangePassword] = useState(false);

  // Cargar datos del usuario en los estados de edición
  useEffect(() => {
    if (user) {
      setEditNombre(user.nombre || '');
      setEditEmail(user.email || '');
      setEditRol(user.rol || 'estudiante');
    }
  }, [user]);

  const handleEditProfile = () => {
    console.log('Abrir modal de edición');
    setEditModalVisible(true);
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    // Validaciones básicas
    if (!editNombre.trim()) {
      Alert.alert('Error', 'El nombre no puede estar vacío');
      return;
    }
    
    if (!editEmail.trim()) {
      Alert.alert('Error', 'El email no puede estar vacío');
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(editEmail)) {
      Alert.alert('Error', 'Por favor ingresa un email válido');
      return;
    }
    
    // Si se quiere cambiar contraseña, validar
    if (showChangePassword) {
      if (!currentPassword) {
        Alert.alert('Error', 'Ingresa tu contraseña actual');
        return;
      }
      
      if (!newPassword) {
        Alert.alert('Error', 'Ingresa la nueva contraseña');
        return;
      }
      
      if (newPassword.length < 6) {
        Alert.alert('Error', 'La nueva contraseña debe tener al menos 6 caracteres');
        return;
      }
      
      if (newPassword !== confirmPassword) {
        Alert.alert('Error', 'Las contraseñas nuevas no coinciden');
        return;
      }
    }
    
    setLoading(true);
    
    try {
      // Primero actualizar los datos del usuario si hubo cambios
      let updateSuccessful = true;
      
      if (editNombre !== user.nombre || editEmail !== user.email || editRol !== user.rol) {
        const updateResponse = await updateUser(user.id, {
          nombre: editNombre.trim(),
          email: editEmail.trim(),
          rol: editRol
        });
        
        if (updateResponse.success && updateResponse.user) {
          // Actualizar el contexto con los nuevos datos del usuario
          if (updateUserContext) {
            updateUserContext(updateResponse.user);
          }
        } else {
          updateSuccessful = false;
          Alert.alert('Error', updateResponse.message || 'Error al actualizar el perfil');
        }
      }
      
      // Luego cambiar la contraseña si se solicitó
      if (updateSuccessful && showChangePassword) {
        const passwordResponse = await changePassword(user.id, currentPassword, newPassword);
        
        if (!passwordResponse.success) {
          Alert.alert('Error', passwordResponse.message || 'Error al cambiar la contraseña');
          updateSuccessful = false;
        }
      }
      
      if (updateSuccessful) {
        Alert.alert('Éxito', 'Perfil actualizado correctamente');
        setEditModalVisible(false);
        // Limpiar campos de contraseña
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setShowChangePassword(false);
      }
      
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar el perfil');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const toggleChangePassword = () => {
    setShowChangePassword(!showChangePassword);
  };

  const handleCancelEdit = () => {
    // Restaurar valores originales
    if (user) {
      setEditNombre(user.nombre || '');
      setEditEmail(user.email || '');
      setEditRol(user.rol || 'estudiante');
    }
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowChangePassword(false);
    setEditModalVisible(false);
  };

  if (!user) {
    return <Loading message="Cargando perfil..." type="fullscreen" />;
  }

  return (
    <View style={globalStyles.screenContainer}>
      <ScrollView
        contentContainerStyle={globalStyles.screenScrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Encabezado */}
        <View style={[globalStyles.screenHeader, globalStyles.marginBottom20]}>
          <Text style={globalStyles.screenTitle}>Mi Perfil</Text>
          <Text style={globalStyles.screenSubtitle}>Información de tu cuenta</Text>
        </View>

        {/* Avatar grande en estilo cascada */}
        <View style={[globalStyles.alignItemsCenter, globalStyles.marginBottom20]}>
          <View style={[
            globalStyles.avatarContainerLarge,
            user.rol === 'profesor' && globalStyles.avatarProfesor
          ]}>
            <Text style={globalStyles.avatarTextLarge}>
              {user.nombre?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
          
          <Text style={[globalStyles.textLarge, globalStyles.marginBottom10]}>
            {user.nombre || 'Usuario'}
          </Text>
          
          <View style={[
            globalStyles.roleBadge,
            user.rol === 'profesor' && globalStyles.roleBadgeProfesor,
            globalStyles.marginBottom20
          ]}>
            <Text style={[globalStyles.text, globalStyles.textWhite, globalStyles.roleText]}>
              {user.rol === 'estudiante' ? 'Estudiante' : 'Profesor'}
            </Text>
          </View>
        </View>

        {/* Tarjeta con TODOS los datos del usuario */}
        <View style={[globalStyles.card, globalStyles.marginBottom20, globalStyles.padding20]}>
          <Text style={[globalStyles.sectionTitle, globalStyles.marginBottom15]}>Información Personal</Text>
          
          {/* ID del usuario */}
          <View style={[globalStyles.dateContainer, globalStyles.marginBottom15]}>
            <Text style={[globalStyles.text, globalStyles.fontWeightBold, globalStyles.flex1, globalStyles.dateLabel]}>ID del usuario:</Text>
            <Text style={[globalStyles.text, globalStyles.flex1, globalStyles.marginLeft10, globalStyles.dateValue]}>{user.id}</Text>
          </View>
          
          {/* Nombre completo */}
          <View style={[globalStyles.dateContainer, globalStyles.marginBottom15]}>
            <Text style={[globalStyles.text, globalStyles.fontWeightBold, globalStyles.flex1, globalStyles.dateLabel]}>Nombre completo:</Text>
            <Text style={[globalStyles.text, globalStyles.flex1, globalStyles.marginLeft10, globalStyles.dateValue]}>{user.nombre || 'No especificado'}</Text>
          </View>
          
          {/* Email */}
          <View style={[globalStyles.dateContainer, globalStyles.marginBottom15]}>
            <Text style={[globalStyles.text, globalStyles.fontWeightBold, globalStyles.flex1, globalStyles.dateLabel]}>Email:</Text>
            <Text style={[globalStyles.text, globalStyles.flex1, globalStyles.marginLeft10, globalStyles.dateValue]}>{user.email || 'No especificado'}</Text>
          </View>
          
          {/* Rol */}
          <View style={[globalStyles.dateContainer, globalStyles.marginBottom15]}>
            <Text style={[globalStyles.text, globalStyles.fontWeightBold, globalStyles.flex1, globalStyles.dateLabel]}>Rol:</Text>
            <View style={[globalStyles.flex1, globalStyles.marginLeft10]}>
              <View style={[
                globalStyles.roleBadge,
                user.rol === 'profesor' && globalStyles.roleBadgeProfesor,
                globalStyles.roleBadgeProfesor
              ]}>
                <Text style={[globalStyles.text, globalStyles.textWhite, globalStyles.roleText]}>
                  {user.rol === 'estudiante' ? 'Estudiante' : 'Profesor'}
                </Text>
              </View>
            </View>
          </View>
          

          {/* Botón para editar */}
          <View style={[globalStyles.alignItemsCenter, globalStyles.marginTop20]}>
            <Button 
              title="✏️ Editar Información del Perfil" 
              onPress={handleEditProfile} 
              type="primary"
              style={globalStyles.widthFull}
            />
          </View>
        </View>
      </ScrollView>

      {/* Modal para editar perfil - VERSIÓN CON ESTILOS GLOBALES */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={handleCancelEdit}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={globalStyles.modalOverlay}>
            <View style={globalStyles.modalContent}>
              <ScrollView 
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                <Text style={globalStyles.modalTitle}>Editar Información del Perfil</Text>
                
                {/* Avatar en el modal */}
                <View style={globalStyles.modalAvatarContainer}>
                  <View style={[
                    globalStyles.modalAvatarCircle,
                    editRol === 'profesor' && globalStyles.avatarProfesor
                  ]}>
                    <Text style={globalStyles.modalAvatarText}>
                      {editNombre?.charAt(0).toUpperCase() || 'U'}
                    </Text>
                  </View>
                  <Text style={globalStyles.modalAvatarLabel}>Avatar actualizado en tiempo real</Text>
                </View>
                
                <View style={globalStyles.modalInputContainer}>
                  <Text style={globalStyles.modalInputLabel}>Nombre Completo</Text>
                  <TextInput
                    style={globalStyles.modalInput}
                    value={editNombre}
                    onChangeText={setEditNombre}
                    placeholder="Ingresa tu nombre completo"
                    autoCapitalize="words"
                    editable={!loading}
                  />
                </View>
                
                <View style={globalStyles.modalInputContainer}>
                  <Text style={globalStyles.modalInputLabel}>Correo Electrónico</Text>
                  <TextInput
                    style={globalStyles.modalInput}
                    value={editEmail}
                    onChangeText={setEditEmail}
                    placeholder="ejemplo@email.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={!loading}
                  />
                </View>
                
                <View style={globalStyles.modalInputContainer}>
                  <Text style={globalStyles.modalInputLabel}>Tipo de Usuario</Text>
                  <View style={globalStyles.modalRoleButtons}>
                    <TouchableOpacity
                      style={[
                        globalStyles.modalRoleButton,
                        globalStyles.modalRoleButtonLeft,
                        editRol === 'estudiante' ? globalStyles.modalRoleButtonActive : globalStyles.modalRoleButtonInactive
                      ]}
                      onPress={() => setEditRol('estudiante')}
                      disabled={loading}
                    >
                      <Text style={[
                        globalStyles.modalRoleButtonText,
                        editRol === 'estudiante' ? globalStyles.modalRoleButtonTextActive : globalStyles.modalRoleButtonTextInactive
                      ]}>
                        👨‍🎓 Estudiante
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[
                        globalStyles.modalRoleButton,
                        globalStyles.modalRoleButtonRight,
                        editRol === 'profesor' ? globalStyles.modalRoleButtonActive : globalStyles.modalRoleButtonInactive
                      ]}
                      onPress={() => setEditRol('profesor')}
                      disabled={loading}
                    >
                      <Text style={[
                        globalStyles.modalRoleButtonText,
                        editRol === 'profesor' ? globalStyles.modalRoleButtonTextActive : globalStyles.modalRoleButtonTextInactive
                      ]}>
                        👨‍🏫 Profesor
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
                
                {/* Sección para cambiar contraseña */}
                <View style={globalStyles.modalPasswordSection}>
                  <View style={globalStyles.modalPasswordHeader}>
                    <Text style={globalStyles.modalPasswordTitle}>🔒 Cambiar Contraseña</Text>
                    <Switch
                      value={showChangePassword}
                      onValueChange={toggleChangePassword}
                      disabled={loading}
                    />
                  </View>
                  
                  {showChangePassword && (
                    <View style={globalStyles.modalPasswordFields}>
                      <View style={globalStyles.modalInputContainer}>
                        <Text style={globalStyles.modalInputLabel}>Contraseña Actual</Text>
                        <TextInput
                          style={globalStyles.modalInput}
                          value={currentPassword}
                          onChangeText={setCurrentPassword}
                          placeholder="Ingresa tu contraseña actual"
                          secureTextEntry={true}
                          editable={!loading}
                        />
                      </View>
                      
                      <View style={globalStyles.modalInputContainer}>
                        <Text style={globalStyles.modalInputLabel}>Nueva Contraseña</Text>
                        <TextInput
                          style={globalStyles.modalInput}
                          value={newPassword}
                          onChangeText={setNewPassword}
                          placeholder="Mínimo 6 caracteres"
                          secureTextEntry={true}
                          editable={!loading}
                        />
                      </View>
                      
                      <View style={globalStyles.modalInputContainer}>
                        <Text style={globalStyles.modalInputLabel}>Confirmar Contraseña</Text>
                        <TextInput
                          style={globalStyles.modalInput}
                          value={confirmPassword}
                          onChangeText={setConfirmPassword}
                          placeholder="Repite la nueva contraseña"
                          secureTextEntry={true}
                          editable={!loading}
                        />
                      </View>
                    </View>
                  )}
                </View>
                
                <View style={globalStyles.modalButtons}>
                  <TouchableOpacity
                    style={globalStyles.modalCancelButton}
                    onPress={handleCancelEdit}
                    disabled={loading}
                  >
                    <Text style={globalStyles.modalCancelButtonText}>Cancelar</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={loading ? globalStyles.modalSaveButtonDisabled : globalStyles.modalSaveButton}
                    onPress={handleSaveProfile}
                    disabled={loading}
                  >
                    <Text style={globalStyles.modalSaveButtonText}>
                      {loading ? "Guardando..." : "Guardar Cambios"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

export default PerfilScreen;