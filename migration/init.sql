CREATE TABLE `app_detail` (
  `app_id` int(11) NOT NULL,
  `app_ip` varchar(30) NOT NULL,
  `hostname` varchar(64) NOT NULL,
  `version` varchar(15) NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8;



CREATE TABLE `logs` (
  `log_id` int(9) NOT NULL,
  `app_name` varchar(100) NOT NULL,
  `date` date NOT NULL,
  `description` text NOT NULL,
  `log_level` varchar(11) NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

CREATE TABLE `chart_table` (
  `chart_id` int(9) NOT NULL,
  `app_name` varchar(100) NOT NULL,
  `log_level` varchar(11) NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

--
-- Tablo için indeksler `app_detail`
--
ALTER TABLE `app_detail`
  ADD PRIMARY KEY (`app_id`);

--
-- Tablo için indeksler `logs`
--
ALTER TABLE `logs`
  ADD PRIMARY KEY (`log_id`);


--
-- Tablo için indeksler `chartTable`
--
ALTER TABLE `chart_table`
  ADD PRIMARY KEY (`chart_id`);

--
-- Dökümü yapılmış tablolar için AUTO_INCREMENT değeri
--

--
-- Tablo için AUTO_INCREMENT değeri `app_detail`
--
ALTER TABLE `app_detail`
  MODIFY `app_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;