CREATE TABLE FileServiceType (
    Id TINYINT PRIMARY KEY,
    Name VARCHAR(20) NOT NULL,
    InitialConfig NVARCHAR(500) NOT NULL
);

INSERT INTO FileServiceType (Id, Name, InitialConfig) VALUES
(0, 'Local', './AppData/Files'),
(1, 'Minio', '{"endpoint": "https://minio.example.com", "accessKey": "your-access-key", "secretKey": "your-secret-key", "bucket": "your-bucket", "region": null}'),
(2, 'AWS S3', '{"region": "ap-southeast-1", "accessKeyId": "your-access-key-id", "secretAccessKey": "your-secret-access-key", "bucket": "your-bucket"}'),
(3, 'Aliyun OSS', '{"endpoint": "oss-cn-hangzhou.aliyuncs.com", "accessKeyId": "your-access-key-id", "accessKeySecret": "your-access-key-secret", "bucket": "your-bucket"}'),
(4, 'Azure Blob Storage', 'DefaultEndpointsProtocol=https;AccountName=your-account-name;AccountKey=your-account-key;EndpointSuffix=core.windows.net');