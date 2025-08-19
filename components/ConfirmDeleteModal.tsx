import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface ConfirmDeleteModalProps {
  visible: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDeleteModal({
  visible,
  title = 'Paylaşımı Sil',
  message,
  confirmText = 'SİL',
  cancelText = 'İPTAL',
  onConfirm,
  onCancel,
}: ConfirmDeleteModalProps) {
  const { colors } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onCancel}
      statusBarTranslucent={true}
    >
      {/* Modal'ı gerçekten ağaç dışına taşıyoruz - hiçbir parent'ın overflow'u etkileyemez */}
      <View style={styles.modalOverlay}>
        <View style={[styles.confirmCard, { backgroundColor: colors?.card || '#fff' }]}>
          {title && (
            <Text style={[styles.confirmTitle, { color: colors?.textDark || '#000' }]}>
              {title}
            </Text>
          )}
          <Text style={[styles.confirmMessage, { color: colors?.textDark || '#000' }]}>
            {message}
          </Text>
          <View style={styles.confirmActions}>
            <TouchableOpacity onPress={onCancel} style={styles.confirmButtonSecondary}>
              <Text style={[styles.confirmButtonTextSecondary, { color: colors?.textMuted || '#666' }]}>
                {cancelText}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onConfirm}
              style={[styles.confirmButtonPrimary, { backgroundColor: colors?.header || '#007AFF' }]}
            >
              <Text style={[styles.confirmButtonTextPrimary, { color: colors?.textLight || '#fff' }]}>
                {confirmText}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    // Modal'ı gerçekten ağaç dışına taşıyoruz
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    // Hiçbir parent'ın overflow'u etkileyemez
    zIndex: 999999,
  },
  confirmCard: {
    width: '90%',
    maxWidth: 420,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
    // Modal'ın kendi overflow'u da hidden olmasın
    overflow: 'visible',
  },
  confirmTitle: {
    fontFamily: 'Nunito-Bold',
    fontSize: 18,
    marginBottom: 8,
    textAlign: 'left',
  },
  confirmMessage: {
    fontFamily: 'Nunito-Regular',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  confirmActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  confirmButtonSecondary: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: 10,
  },
  confirmButtonPrimary: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  confirmButtonTextSecondary: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 14,
  },
  confirmButtonTextPrimary: {
    fontFamily: 'Nunito-Bold',
    fontSize: 14,
  },
});
