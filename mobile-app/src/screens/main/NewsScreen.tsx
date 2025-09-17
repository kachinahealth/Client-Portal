import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    TouchableOpacity,
    Modal,
    Dimensions,
    SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Pdf from 'react-native-pdf';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

const { width, height } = Dimensions.get('window');

export default function NewsScreen() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [news, setNews] = useState<any[]>([]);
    const [pdfs, setPdfs] = useState<any[]>([]);
    const [selectedPdf, setSelectedPdf] = useState<string | null>(null);
    const [pdfModalVisible, setPdfModalVisible] = useState(false);

    useEffect(() => {
        loadNewsData();
    }, []);

    const loadNewsData = async () => {
        try {
            setLoading(true);
            setError(null);
            const [newsData, pdfsData] = await Promise.all([
                api.getNews(user?.companyId || 'cerevasc'),
                api.getPDFs(user?.companyId || 'cerevasc')
            ]);
            setNews(newsData.news || []);
            setPdfs(pdfsData.pdfs || []);
        } catch (err) {
            setError('Failed to load news data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const openPDF = (pdfUrl: string) => {
        setSelectedPdf(pdfUrl);
        setPdfModalVisible(true);
    };

    const PDFViewer = () => (
        <Modal
            animationType="slide"
            transparent={false}
            visible={pdfModalVisible}
            onRequestClose={() => setPdfModalVisible(false)}
        >
            <SafeAreaView style={styles.pdfContainer}>
                <View style={styles.pdfHeader}>
                    <TouchableOpacity
                        onPress={() => setPdfModalVisible(false)}
                        style={styles.closeButton}
                    >
                        <Ionicons name="close" size={28} color="#1976d2" />
                    </TouchableOpacity>
                    <Text style={styles.pdfHeaderTitle}>Document Viewer</Text>
                </View>
                {selectedPdf && (
                    <Pdf
                        source={{ uri: selectedPdf }}
                        style={styles.pdf}
                        onLoadComplete={(numberOfPages, filePath) => {
                            console.log(`PDF loaded: ${numberOfPages} pages`);
                        }}
                        onError={(error) => {
                            console.error('PDF Error:', error);
                        }}
                    />
                )}
            </SafeAreaView>
        </Modal>
    );

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#1976d2" />
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                <View style={styles.header}>
                    <Text style={styles.title}>News & Updates</Text>
                    <Text style={styles.subtitle}>Latest Trial Information</Text>
                </View>

                <View style={styles.newsContainer}>
                    {news.map((item) => (
                        <View key={item.id} style={styles.newsCard}>
                            <View style={styles.newsHeader}>
                                <Ionicons name="newspaper-outline" size={24} color="#1976d2" />
                                <Text style={styles.newsDate}>
                                    {new Date(item.date).toLocaleDateString()}
                                </Text>
                            </View>
                            <Text style={styles.newsTitle}>{item.title}</Text>
                            <Text style={styles.newsContent}>{item.content}</Text>
                        </View>
                    ))}

                    {pdfs.map((pdf) => (
                        <TouchableOpacity
                            key={pdf.id}
                            style={styles.pdfCard}
                            onPress={() => openPDF(`http://192.168.0.23:3000/api/company/${user?.companyId || 'cerevasc'}/pdfs/${pdf.id}/file`)}
                        >
                            <View style={styles.pdfHeader}>
                                <Ionicons name="document-text-outline" size={24} color="#1976d2" />
                                <Text style={styles.pdfDate}>
                                    {new Date(pdf.uploadDate).toLocaleDateString()}
                                </Text>
                            </View>
                            <Text style={styles.pdfTitle}>{pdf.title}</Text>
                            <Text style={styles.pdfMeta}>Tap to view PDF</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
            <PDFViewer />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  newsContainer: {
    padding: 20,
    gap: 15,
  },
  newsCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  newsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  newsDate: {
    fontSize: 14,
    color: '#666',
  },
  newsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  newsContent: {
    fontSize: 16,
    color: '#444',
    lineHeight: 24,
  },
  pdfCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginTop: 10,
  },
  pdfHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  pdfDate: {
    fontSize: 14,
    color: '#666',
  },
  pdfTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  pdfMeta: {
    fontSize: 14,
    color: '#666',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  errorText: {
    color: 'red',
    fontSize: 18,
    textAlign: 'center',
  },
    pdfContainer: {
        flex: 1,
        backgroundColor: '#fff',
    },
    pdfHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e1e1e1',
    },
    closeButton: {
        padding: 8,
    },
    pdfHeaderTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginLeft: 16,
        color: '#1a1a1a',
    },
    pdf: {
        flex: 1,
        width: width,
        height: height,
    },
});
