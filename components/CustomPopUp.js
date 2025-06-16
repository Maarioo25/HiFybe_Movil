import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Modal from 'react-native-modal';

// Componente para mostrar un popup personalizado
export default function CustomPopUp({ visible, onClose, children }) {
  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      backdropOpacity={0.5}
      style={styles.modal}
    >
      <View style={styles.popup}>
        {children}
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeText}>Cerrar</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  popup: {
    backgroundColor: '#2A6B6B',
    padding: 20,
    borderRadius: 20,
    width: '85%',
    alignItems: 'center',
  },
  closeButton: {
    marginTop: 15,
    backgroundColor: '#4ECCA3',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 10,
  },
  closeText: {
    color: '#1E4E4E',
    fontWeight: 'bold',
  },
});
