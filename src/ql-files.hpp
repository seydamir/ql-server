#ifndef QL_FILES_H
    #define QL_FILES_H

#include <QString>
#include <QStringList>
#include <QDir>
#include <QFile>
#include <QFileInfo>
#include <QTextStream>
#include <QByteArray>
#include <QList>
#include <QVariant>
#include <QUrl>

class QlFiles : public QObject {
    Q_OBJECT

    public:
        QlFiles();
        QlFiles(QObject* parent);

        Q_INVOKABLE QString urlToLocalFile(const QUrl &path);

        Q_INVOKABLE QStringList entryList(const QString &dir, const QStringList &nameFilters);

        Q_INVOKABLE QString separator();
        Q_INVOKABLE QString currentPath();
        Q_INVOKABLE QString absolutePath(const QString &path);
        Q_INVOKABLE QString canonicalPath(const QString &path);

        Q_INVOKABLE bool exists(const QString &path);
        Q_INVOKABLE bool match(const QString &filter, const QString &path);
        Q_INVOKABLE bool isFile(const QString &path);
        Q_INVOKABLE bool isDir(const QString &path);

        Q_INVOKABLE qint64 size(const QString &path);
        Q_INVOKABLE QString path(const QString &path);
        Q_INVOKABLE QString name(const QString &path);
        Q_INVOKABLE QString ext(const QString &path);

        Q_INVOKABLE QString readString(const QString &path, const QString &codec);
        Q_INVOKABLE bool    writeString(const QString &path, const QString &s, const QString &codec);

        Q_INVOKABLE QList<QVariant> readBytes(const QString &path);
        Q_INVOKABLE bool            writeBytes(const QString &path, const QList<QVariant> &b);

		static QStringList argv_;
		Q_INVOKABLE QStringList argv();

    private:
};

#endif

