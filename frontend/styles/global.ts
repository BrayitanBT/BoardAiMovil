// src/styles/global.ts
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  // ============ CONTENEDORES Y LAYOUT PRINCIPAL ============
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  
  // Contenedores estandarizados para todas las pantallas
  screenContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  screenScrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  screenHeader: {
    marginBottom: 20,
    paddingTop: 10,
  },
  
  // ============ UTILIDADES DE FLEX ============
  flex1: {
    flex: 1,
  },
  
  // ============ TARJETA DE BIENVENIDA ============
  welcomeCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    borderLeftWidth: 5,
    borderLeftColor: '#3498db',
  },
  welcomeIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  welcomeIcon: {
    fontSize: 24,
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 2,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  welcomeDescription: {
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
    textAlign: 'center',
  },
  
  // ============ GRID DE CARACTERÍSTICAS ============
  featuresGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  featureItem: {
    width: '32%',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    marginBottom: 5,
  },
  featureIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  featureTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 3,
  },
  featureDescription: {
    fontSize: 10,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 14,
  },
  
  // ============ TARJETA DE USUARIO ============
  userCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  avatarContainerMedium: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarTextMedium: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
  },
  userGreeting: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 2,
  },
  userRole: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 2,
    fontWeight: '500',
  },
  userEmail: {
    fontSize: 13,
    color: '#95a5a6',
    fontStyle: 'italic',
  },
  userActionButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
  },
  profileActionButton: {
    backgroundColor: '#e3f2fd',
    borderWidth: 1,
    borderColor: '#bbdefb',
  },
  logoutActionButton: {
    backgroundColor: '#ffebee',
    borderWidth: 1,
    borderColor: '#ffcdd2',
  },
  userActionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1976d2',
  },
  
  // ============ TEXTOS Y TIPOGRAFÍA ============
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 30,
    textAlign: 'center',
  },
  text: {
    fontSize: 16,
    color: '#333',
  },
  textSmall: {
    fontSize: 13,
    color: '#7f8c8d',
    marginTop: 2,
  },
  
  // Estilos de texto adicionales
  textPrimary: {
    color: '#3498db',
  },
  textDanger: {
    color: '#e74c3c',
  },
  textSuccess: {
    color: '#2ecc71',
  },
  textDate: {
    fontSize: 12,
    color: '#7f8c8d',
    fontStyle: 'italic',
  },
  textBadge: {
    fontSize: 11,
    fontWeight: '500',
    color: '#4caf50',
  },
  
  errorText: {
    color: '#e74c3c',
    fontSize: 14,
    marginTop: 5,
  },
  textCenter: {
    textAlign: 'center',
  },
  noDataText: {
    textAlign: 'center',
    color: '#7f8c8d',
    fontStyle: 'italic',
    marginTop: 20,
  },
  emptyText: {
    textAlign: 'center',
    color: '#7f8c8d',
    fontStyle: 'italic',
    marginTop: 20,
    padding: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  
  // Títulos estandarizados para pantallas
  screenTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
    textAlign: 'left',
    paddingHorizontal: 5,
  },
  screenSubtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 15,
    textAlign: 'left',
  },
  
  // ============ BOTONES Y CONTROLES ============
  button: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonSecondary: {
    backgroundColor: '#41be30ff',
  },
  buttonDanger: {
    backgroundColor: '#e74c3c',
  },
  buttonDisabled: {
    backgroundColor: '#bdc3c7',
  },
  smallButton: {
    paddingHorizontal: 15,
    paddingVertical: 5,
  },
  
  // ============ FILTROS Y SELECTORES ============
  materiaFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 10,
  },
  materiaFilterButtonSelected: {
    backgroundColor: '#2980b9',
  },
  materiaFilterButtonUnselected: {
    backgroundColor: '#95a5a6',
  },
  
  // ============ INPUTS Y FORMULARIOS ============
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    color: '#2c3e50',
    marginBottom: 5,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  inputError: {
    borderColor: '#e74c3c',
  },
  inputMultiline: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  inputFocused: {
    borderColor: '#3498db',
    borderWidth: 2,
  },
  
  // ============ CARDS Y TARJETAS ============
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  cardText: {
    color: '#7f8c8d',
    fontSize: 14,
  },
  materiaItem: {
    marginBottom: 10,
  },
  tipsCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 5,
    borderLeftColor: '#ff9800',
  },
  
  // ============ CHATBOT Y ASISTENTE IA ============
  chatbotPreview: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginVertical: 8,
    borderLeftWidth: 5,
    borderLeftColor: '#2196f3',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  chatbotIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatbotIcon: {
    fontSize: 28,
  },
  chatbotContent: {
    flex: 1,
    marginLeft: 15,
  },
  chatbotTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 3,
  },
  chatbotSubtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  chevronIcon: {
    fontSize: 24,
    color: '#2196f3',
    fontWeight: 'bold',
  },
  chatFeatureBadge: {
    backgroundColor: '#e8f5e8',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  chatFeatureText: {
    fontSize: 11,
    color: '#4caf50',
    fontWeight: '500',
  },
  
  // ============ PANTALLA DE CHATBOT ============
  chatbotHeaderIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  chatbotHeaderIconText: {
    fontSize: 24,
  },
  chatbotHeaderTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  chatbotHeaderSubtitle: {
    fontSize: 13,
    color: '#7f8c8d',
    marginTop: 2,
  },
  clearChatButton: {
    padding: 10,
  },
  clearChatButtonText: {
    fontSize: 20,
    color: '#666',
  },
  chatHistoryContainer: {
    flex: 1,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  chatMessageContainer: {
    marginBottom: 15,
  },
  chatMessageUserContainer: {
    alignItems: 'flex-end',
  },
  chatMessageBotContainer: {
    alignItems: 'flex-start',
  },
  chatMessageBubble: {
    maxWidth: '85%',
    padding: 15,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  chatMessageUserBubble: {
    backgroundColor: '#007aff',
    borderBottomRightRadius: 5,
  },
  chatMessageBotBubble: {
    backgroundColor: '#f0f0f0',
    borderBottomLeftRadius: 5,
  },
  chatMessageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  chatMessageUserText: {
    color: 'white',
  },
  chatMessageBotText: {
    color: '#333',
  },
  chatMessageTime: {
    fontSize: 11,
    marginTop: 6,
    opacity: 0.7,
  },
  chatMessageUserTime: {
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'right',
  },
  chatMessageBotTime: {
    color: '#666',
    textAlign: 'left',
  },
  chatInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: 'white',
  },
  chatInput: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 25,
    paddingHorizontal: 18,
    paddingVertical: 12,
    fontSize: 15,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  chatSendButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#007aff',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
    shadowColor: '#007aff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  chatSendButtonDisabled: {
    backgroundColor: '#ccc',
    shadowOpacity: 0,
  },
  chatSendButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  chatInfoContainer: {
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  chatInfoText: {
    fontSize: 13,
    color: '#6c757d',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  typingIndicator: {
    alignItems: 'center',
  },
  typingText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 5,
  },
  typingDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#999',
    marginHorizontal: 2,
  },
  
  // ============ AVATARES E IDENTIDAD ============
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarProfesor: {
    backgroundColor: '#9b59b6',
  },
  avatarText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  
  // ============ BADGES, ETIQUETAS Y ESTADOS ============
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeSuccess: {
    backgroundColor: '#2ecc71',
  },
  badgeWarning: {
    backgroundColor: '#f39c12',
  },
  badgeInfo: {
    backgroundColor: '#3498db',
  },
  badgeDanger: {
    backgroundColor: '#e74c3c',
  },
  roleBadge: {
    backgroundColor: '#2ecc71',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 20,
  },
  roleBadgeProfesor: {
    backgroundColor: '#9b59b6',
  },
  roleBadgeWarning: {
    backgroundColor: '#f39c12',
  },
  roleTextValue: {
    color: 'black',
    fontWeight: '600',
  },
  roleValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3498db',
    marginLeft: 5,
  },
  logoutText: {
    color: '#e74c3c',
    fontSize: 16,
  },
  
  // ============ UTILIDADES DE LAYOUT Y FLEXBOX ============
  horizontalLayout: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  justifyContentBetween: {
    justifyContent: 'space-between',
  },
  justifyContentCenter: {
    justifyContent: 'center',
  },
  alignItemsCenter: {
    alignItems: 'center',
  },
  
  // Utilidades de alineación
  alignSelfEnd: {
    alignSelf: 'flex-end',
  },
  
  // ============ UTILIDADES DE ESPACIADO ============
  marginTop5: { 
    marginTop: 5 
  },
  marginTop10: { 
    marginTop: 10 
  },
  marginTop15: { 
    marginTop: 15 
  },
  marginTop20: { 
    marginTop: 20 
  },
  marginTop30: { 
    marginTop: 30 
  },
  marginTop40: { 
    marginTop: 40 
  },
  marginTop50: { 
    marginTop: 50 
  },
  marginBottom3: { 
    marginBottom: 3 
  },
  marginBottom5: { 
    marginBottom: 5 
  },
  marginBottom8: { 
    marginBottom: 8 
  },
  marginBottom10: { 
    marginBottom: 10 
  },
  marginBottom15: { 
    marginBottom: 15 
  },
  marginBottom20: { 
    marginBottom: 20 
  },
  marginBottom25: { 
    marginBottom: 25 
  },
  marginBottom30: { 
    marginBottom: 30 
  },
  marginBottom35: { 
    marginBottom: 35 
  },
  marginBottom40: { 
    marginBottom: 40 
  },
  marginBottom50: { 
    marginBottom: 50 
  },
  marginRight8: {
    marginRight: 8,
  },
  marginRight10: {
    marginRight: 10,
  },
  marginRight15: {
    marginRight: 15,
  },
  marginLeft10: {
    marginLeft: 10,
  },
  marginVertical5: {
    marginVertical: 5,
  },
  marginVertical10: {
    marginVertical: 10,
  },
  marginVertical15: {
    marginVertical: 15,
  },
  marginVertical20: {
    marginVertical: 20,
  },
  padding10: {
    padding: 10,
  },
  padding15: {
    padding: 15,
  },
  padding20: {
    padding: 20,
  },
  padding25: {
    padding: 25,
  },
  padding30: {
    padding: 30,
  },
  paddingVertical30: {
    paddingVertical: 30,
  },
  paddingHorizontal30: {
    paddingHorizontal: 30,
  },
  gap5: {
    gap: 5,
  },
  gap10: {
    gap: 10,
  },
  gap15: {
    gap: 15,
  },
  
  // ============ COLORES DE FONDO ============
  backgroundColorLightBlue: {
    backgroundColor: '#e8f4fd',
  },
  
  // ============ PERFILES Y SECCIONES ============
  profileInfo: {
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  section: {
    marginVertical: 15,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 5,
  },
  profileCard: {
    alignItems: 'center',
  },
  roleContainer: {
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    backgroundColor: '#ecf0f1',
  },
  
  // ============ TIPS Y LISTAS ============
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  tipNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3498db',
    marginRight: 10,
    minWidth: 20,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  
  // ============ FOOTER Y MISCELÁNEOS ============
  footerContainer: {
    alignItems: 'center',
  },
  footerText: {
    color: '#95a5a6',
  },
  footerSubtext: {
    color: '#bdc3c7',
    marginTop: 5,
  },

  // ============ ESTILOS ESPECÍFICOS PARA TEXTOS ============
  textWithPaddingTop: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    paddingTop: 20,
  },
  textContainerWithMargin: {
    marginTop: 20,
  },
  textContainerWithPadding: {
    paddingTop: 20,
  },
  lineHeight18: {
    lineHeight: 18,
  },
  lineHeight20: {
    lineHeight: 20,
  },
  lineHeight22: {
    lineHeight: 22,
  },
  fontWeight600: {
    fontWeight: '600',
  },
  fontWeightBold: {
    fontWeight: 'bold',
  },

  // ============ ESTILOS DE NAVEGACIÓN ============
  navigationHeader: {
    backgroundColor: '#3498db',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  navigationHeaderTitle: {
    fontWeight: 'bold',
    fontSize: 18
  },
  navigationHeaderLogin: {
    backgroundColor: '#3498db',
  },
  navigationHeaderRegister: {
    backgroundColor: '#2980b9',
  },
  navigationHeaderHome: {
    backgroundColor: '#2c3e50',
  },
  navigationHeaderMaterias: {
    backgroundColor: '#3498db',
  },
  navigationHeaderTareas: {
    backgroundColor: '#3498db',
  },
  navigationHeaderCrearMateria: {
    backgroundColor: '#27ae60',
  },
  navigationHeaderCrearTarea: {
    backgroundColor: '#27ae60',
  },
  navigationHeaderEntregas: {
    backgroundColor: '#9b59b6',
  },
  navigationHeaderPerfil: {
    backgroundColor: '#e67e22',
  },
  navigationHeaderDetalleEntrega: {
    backgroundColor: '#34495e',
  },
  navigationHeaderCalificarEntrega: {
    backgroundColor: '#f39c12',
  },
  navigationHeaderChatbot: {
    backgroundColor: '#9c27b0',
  },
  navigationCard: {
    backgroundColor: '#f5f5f5'
  },

  // ============ ESTILOS PARA MODALES ============
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContentWrapper: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalWideContainer: {
    width: '95%',
    maxHeight: '85%',
    backgroundColor: 'white',
    borderRadius: 15,
    overflow: 'hidden',
  },
  modalScrollContent: {
    padding: 20,
    paddingBottom: 30,
  },

  // Modal para perfil
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxHeight: '90%',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalAvatarContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modalAvatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalAvatarText: {
    color: 'white',
    fontSize: 30,
    fontWeight: 'bold',
  },
  modalAvatarLabel: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  modalInputContainer: {
    marginBottom: 20,
  },
  modalInputLabel: {
    fontSize: 16,
    color: '#2c3e50',
    marginBottom: 8,
    fontWeight: '500',
  },
  modalInput: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  modalRoleButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
  },
  modalRoleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalRoleButtonLeft: {
    borderRightWidth: 1,
    borderRightColor: '#ddd',
  },
  modalRoleButtonRight: {},
  modalRoleButtonActive: {
    backgroundColor: '#3498db',
  },
  modalRoleButtonInactive: {
    backgroundColor: '#f5f5f5',
  },
  modalRoleButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  modalRoleButtonTextActive: {
    color: 'white',
  },
  modalRoleButtonTextInactive: {
    color: '#666',
  },
  modalPasswordSection: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
  },
  modalPasswordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalPasswordTitle: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '500',
  },
  modalPasswordFields: {
    marginTop: 15,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: '#95a5a6',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 10,
  },
  modalCancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  modalSaveButton: {
    flex: 1,
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 10,
  },
  modalSaveButtonDisabled: {
    flex: 1,
    backgroundColor: '#bdc3c7',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 10,
  },
  modalSaveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },

  // Estilo para modal padding reducido
  modalPadding: {
    padding: 10,
  },

  // ============ ESTILOS ESPECÍFICOS PARA PERFIL ============
  // Estilos para avatar grande
  avatarContainerLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarTextLarge: {
    color: 'white',
    fontSize: 36,
    fontWeight: 'bold',
  },

  // Estilos para texto grande
  textLarge: {
    fontSize: 24,
    color: '#2c3e50',
    fontWeight: '600',
  },

  // Estilos específicos para fechas
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  dateLabel: {
    fontWeight: 'bold',
    flex: 1,
  },
  dateValue: {
    flex: 1,
    marginLeft: 10,
  },

  // Estilos para textos de rol
  roleText: {
    fontSize: 14,
  },
  
  // Estilo para ancho completo
  widthFull: {
    width: '100%',
  },

  // Estilo para texto blanco
  textWhite: {
    color: 'white',
  },

  // ============ ESTILOS ESPECÍFICOS PARA MATERIAS ============
  // Tarjeta especial para materias
  materiaCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    borderLeftWidth: 5,
    borderLeftColor: '#3498db',
  },

  // Título de materia
  materiaCardTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
    lineHeight: 24,
  },

  // Descripción de materia
  materiaCardDescription: {
    fontSize: 15,
    color: '#5d6d7e',
    lineHeight: 22,
    marginBottom: 12,
  },

  // Información adicional de materia
  materiaCardInfo: {
    fontSize: 14,
    color: '#7f8c8d',
    fontStyle: 'italic',
    marginTop: 4,
  },

  // Badge para estado de materia
  materiaBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 8,
    marginBottom: 12,
  },

  materiaBadgeInscrito: {
    backgroundColor: '#d5f4e6',
  },

  materiaBadgeNoInscrito: {
    backgroundColor: '#fef9e7',
  },

  materiaBadgeTexto: {
    fontSize: 13,
    fontWeight: '600',
  },

  materiaBadgeTextoInscrito: {
    color: '#27ae60',
  },

  materiaBadgeTextoNoInscrito: {
    color: '#f39c12',
  },

  // Contenedor de botones para materias
  materiaButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
  },

  // Botones específicos para materias
  materiaButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  materiaButtonLeft: {
    marginRight: 8,
  },

  materiaButtonRight: {
    marginLeft: 8,
  },

  // Estilo para cuando hay muchas materias
  materiasGrid: {
    flexDirection: 'column',
  },

  // Estado vacío para materias
  materiasEmptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 30,
    backgroundColor: 'white',
    borderRadius: 12,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },

  materiasEmptyIcon: {
    fontSize: 56,
    color: '#bdc3c7',
    marginBottom: 20,
  },

  materiasEmptyText: {
    fontSize: 17,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 8,
  },

  materiasEmptySubtext: {
    fontSize: 14,
    color: '#95a5a6',
    textAlign: 'center',
    lineHeight: 20,
  },

  // Filtros para materias
  materiasFilterContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },

  materiasFilterButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },

  materiasFilterButtonActive: {
    backgroundColor: '#3498db',
  },

  materiasFilterButtonInactive: {
    backgroundColor: '#f8f9fa',
  },

  materiasFilterText: {
    fontSize: 14,
    fontWeight: '600',
  },

  materiasFilterTextActive: {
    color: 'white',
  },

  materiasFilterTextInactive: {
    color: '#7f8c8d',
  },

  // Contador de materias
  materiasCounter: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 16,
    fontWeight: '500',
  },

  // ============ UTILIDADES ADICIONALES ============
  marginHorizontal4: {
    marginHorizontal: 4,
  },

  marginHorizontal8: {
    marginHorizontal: 8,
  },

  paddingVertical12: {
    paddingVertical: 12,
  },

  paddingHorizontal16: {
    paddingHorizontal: 16,
  },

  // ============ ESPACIADO ADICIONAL ============
  marginBottom12: {
    marginBottom: 12,
  },

  marginHorizontal5: {
    marginHorizontal: 5,
  },
});

// Exportar configuraciones de navegación como objetos separados
export const navigationStyles = {
  // Configuración global para screenOptions
  screenOptions: {
    headerStyle: styles.navigationHeader,
    headerTintColor: 'white',
    headerTitleStyle: styles.navigationHeaderTitle,
    cardStyle: styles.navigationCard,
  },

  // Opciones específicas por pantalla
  screenOptionsByRoute: {
    Login: {
      headerShown: false
    },
    Register: {
      title: 'Registro',
      headerStyle: styles.navigationHeaderRegister
    },
    Home: {
      title: 'Inicio',
      headerLeft: () => null,
      headerStyle: styles.navigationHeaderHome
    },
    Materias: {
      title: 'Materias',
      headerStyle: styles.navigationHeaderMaterias
    },
    Tareas: {
      title: 'Tareas',
      headerStyle: styles.navigationHeaderTareas
    },
    CrearMateria: {
      title: 'Nueva Materia',
      headerStyle: styles.navigationHeaderCrearMateria
    },
    CrearTarea: {
      title: 'Nueva Tarea',
      headerStyle: styles.navigationHeaderCrearTarea
    },
    Entregas: {
      title: 'Entregas',
      headerStyle: styles.navigationHeaderEntregas
    },
    Perfil: {
      title: 'Mi Perfil',
      headerStyle: styles.navigationHeaderPerfil
    },
    DetalleEntrega: {
      title: 'Detalle de Entrega',
      headerStyle: styles.navigationHeaderDetalleEntrega
    },
    CalificarEntrega: {
      title: 'Calificar Entrega',
      headerStyle: styles.navigationHeaderCalificarEntrega
    },
    Chatbot: {
      title: 'Billy - Asistente',
      headerStyle: styles.navigationHeaderChatbot
    }
  }
};