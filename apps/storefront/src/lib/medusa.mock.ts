export interface MockProduct {
  id: string
  title: string
  price: string
  originalPrice?: string
  imageUrl: string
  badge?: string
  badgeVariant?: 'orange' | 'brown' | 'gold'
  href: string
}

export interface MockCollection {
  id: string
  title: string
  imageUrl: string
  href: string
}

export async function getFeaturedProducts(): Promise<MockProduct[]> {
  return [
    {
      id: 'prod-001',
      title: 'Halden Brass Pendant Lamp',
      price: 'Rs. 12,499',
      imageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCANOptNKLqqXac6npIqILD4NXdVoZuS08iNpILkUUEnZZkfGFDYmwTK_A2Sfpw0P7dIGUKXXiECV-HU8ZLtkZDwiQwlQdbPl5ctax5hE24RGTIdiDqQFtX68qtGy4mIIciNgpowYqjojjmd6CCJoLxMlpo7aPunhpVZeujaMzV7Sh5Bw_mg8a27hc_ZDpwRtgLkKvtiK2RQIzSGYnBka9Rhho_aTrnf-Vn6NO2VnYFXVVYBLobHZqk7KagK86xsEN2fU3HygrddwVP',
      badge: 'BESTSELLER',
      badgeVariant: 'orange',
      href: '/products/halden-brass-pendant-lamp',
    },
    {
      id: 'prod-002',
      title: 'Linen Table Runner',
      price: 'Rs. 1,899',
      originalPrice: 'Rs. 2,374',
      imageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCo4OVwzuFK5Kcl4Fv6YgNm50PiIOs5D0Eb1dYidSAJ4m6ujDXxYt4n8o_ufgfZCniF-2GWRV3ufMA6pZe0fEe5_ZFTUQoqG8yhoe6mTvlz3HySvk5kkPGIr6GxXok9r2RnB2QtYot4xibhZ-y6LVUe8NLmoHhqaRbY_qtDHf86pdGHtYKIgyP1kKJkUEEvTcySIZNVSgyDzdQAIrJZ_BAUB6hKHVP9VSfPcc3LestCEzEOQSpvTb9VNCQ8nEmvE99Y5ZBUBliWe6N4',
      badge: '-20%',
      badgeVariant: 'brown',
      href: '/products/linen-table-runner',
    },
    {
      id: 'prod-003',
      title: 'Stoneware Dinner Plate',
      price: 'Rs. 699',
      imageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuC8oXPpbc7KUC4UrIt0Dm2NEy0mE5ZESFd51HYN8zYm5w0vGD4KMvdWHflTLXBUFcRzP910fMDPQoGZdgDak86QsiURNwrjEb0dsVGewVb9cGni-mNn3KjPD4NeGJ2fc6oSITw1k-oILM8iMQrE4YMB7VI8XWw6g5eA42TibKXGKNCFM0iYPHHwuvzS4IS3ROmFFEI3q3wFevbFlefXSGPMAq5bdD6ICW6wQ3Buf7h-wsqS54hgef2WL8pSLhNVaPo3pEkhe7oOmGg8',
      href: '/products/stoneware-dinner-plate',
    },
    {
      id: 'prod-004',
      title: 'Terracotta Garden Planter',
      price: 'Rs. 2,299',
      imageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuAhILr_TMU7gK1FkE4QBKh8SZ4dGRE7YdTL9Ei_llHiN7E9xpfpxX7oDNGF0JQTD1ny86CRCtuQhfPs8F_j7olgLIgF5rKesHG71NBtAQNuBgwXJLuJWhWlqPVkV2tI05MX7ykW_P2HrjyDjoMaWbsNylz2D9uv47xASlBrHE5Bb--XJtdMULP2u14bOUdhnCwVLJzWXL5w9kONBFUGTuamx7UyhWT9Ebk_piS0_ZivVfDxvWbljY4IOTY2-aiaZMnL4smzkvsqR786b',
      badge: 'NEW',
      badgeVariant: 'gold',
      href: '/products/terracotta-garden-planter',
    },
  ]
}

export async function getNewArrivals(): Promise<MockProduct[]> {
  return [
    {
      id: 'prod-005',
      title: 'Smoked Glass Wine Set',
      price: 'Rs. 3,499',
      imageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCh5AO2pcomAfbmiQWvmF1DXpZb8x7ZBjZ2j47a9QjUFx-CaZfglnSQUabjTSss4oP2qn6JbQuSY754CiPLnlFNYGtPXfiWrxPGt4QOl2783m7eGSiVhv_JK9r-FBzyGUMik0lL0L3iYruSmS09ifXiTIdTxNgSXbx2z6VbWW8wRNpCbLXAKLSSOZCvf1IZWPMU47mpFOQSXqPPj0X3niH6iWUB06aFExJ3Z5wCuXYepdNo5jiDZ_NC4fR0nAzSQxVgVlUjaHA1aWmS',
      badge: 'NEW',
      badgeVariant: 'gold',
      href: '/products/smoked-glass-wine-set',
    },
    {
      id: 'prod-006',
      title: 'Cotton Bath Towel',
      price: 'Rs. 899',
      imageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBoPFeJVIob-Hh-7rZ0K_j60S7Fq1YTZwKtQtzY0l5urp__6qPAXxFZX78otTrQY5VyA3M18w9B0H_9a4SwqUnOpuCxJJ28ZwOwIBkHmGZ4e4y3GJquSJGdla5elmxDBxMtwtx_r7H_1iYSn3EEBZ86hAdyT70GDZxhZTeuPsmYnOUvTkyopSoOkP47ZmHvzWpxKVDiLerQ_Sikhqae01AGRhEtPzJJC6sCmIPFC6tulGmaiqh_3aT323zVvce3kgY5c4uRJOm2VI5K',
      href: '/products/cotton-bath-towel',
    },
    {
      id: 'prod-007',
      title: 'Artificial Peony Bouquet',
      price: 'Rs. 1,299',
      imageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCL9GzMCaANTLBcDQMWEBy_Yk3iY92MCRSD5hpHqJ0RCmgjruCL5bADfa1HcNQhVud3PDUFrrH3kJnPlQ-Y1la3Se73MkTSNRdsbzhCRFFE1JqFuPld3JiDrsTUymBMee-UPemSg_Bt1ia6fixNF_Pyxsk85FgUL6Cfd3zxXk_PDgoNOhlhikX1f9FzMiHmHmFrLvnCQ8COLh2lG2G5b_Hdpxv5Ylrelc-naW6RkoNqqfsTDgywKY0SlmI8n9fRFlbQcR9_R_DB7QOb',
      badge: 'NEW',
      badgeVariant: 'gold',
      href: '/products/artificial-peony-bouquet',
    },
    {
      id: 'prod-008',
      title: 'Outdoor Pendant Lantern',
      price: 'Rs. 4,499',
      imageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBLwUXaSEmX0PomLBhK0r75vGqlPRZiRITx4ERRWOrvT5Q3BBT5Qma5elAMUbF3OXyjKZHKDhGvmY5kOdlUrqcjr1rQzV_bZv1b1LeQTBRpvwXNbks5ip7kGgrp29DOJjQsypwYzETtxn7wZ0jRj_TSeDnaeuJqAUPetccX6LKCesQsrPY82k-JNbQiwX7SgL9oOv4-lE6w_7c1_DSfokYnDpvjqU9GK2m-kxuOi_QZdf3vy6nixY0NVoAkpBwWqBILNVyW8i4xIfRG',
      href: '/products/outdoor-pendant-lantern',
    },
  ]
}

export async function getCollections(): Promise<MockCollection[]> {
  return [
    {
      id: 'col-001',
      title: 'Decor',
      imageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCB18pFWv0F8nCk7hca-xfGeSAjmJYAPLKTe2xFxlOsRIgzupprVn8Td-Mr_J0_6K88dLbI_USu1r8NWITOuX5Y073K6pADYTvCPb-kdAniL7ulEMOkC4uSrxozgVx8cDur6xeiGIZRtkTgm0JD5VS19mtfNGFwXqrZ8VM52Z11fBIcrt2d2Q2pWNWubeVUMaiu476IYboV-KGgSkuYZSX6EbenkZcZUQzgzW3VKe_Z7aGUzrweGLuFq8fZsixKCFID6C16z-osX_PQ',
      href: '/collections/decor',
    },
    {
      id: 'col-002',
      title: 'Bed & Bath',
      imageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBjdfglh5z-vIjWyQEkxrqRvYNoQeIzoqguwr_YLMJDOpICw0jr1N1Ov5B0jxux8rzK3pm3HHzwf2MS_h-SQUFov95Unk-gcmIu5tcwAVEiNtWWtu7W92YRVeQ8GKAqiYUmmtZAJd7r4qhuf3I08W8M_mHYneebc7k0gOrDo3j6PGibwrxbl6wEPTC0xeAXv1-OJdx8KL9Qy4GgjIE60iL5gnGLSKP4f2sK6fqUxc9tP3YZHkFLry_ZOmNVVTyEQq5AjYmWKsPeiESn',
      href: '/collections/bed-bath',
    },
    {
      id: 'col-003',
      title: 'Kitchen & Dining',
      imageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCX4vZU0SJ3HH0tNUc1RA3oFuZk4B8jZbqLGoychMwg2TUho-R2aAJ_lb0pLOhKHcH3aWnXgAfB4SUUt85baBPM42ZS1JhsJXu6Zro73_DSZUp_6kNonr3mVbdMQd80eQRJj-YHiN92zgUGFZxcHLFsQleCpjUsB8V7ITgxLfrEJofV2uDHTEtdJPcyyLt56gU2pqPSu5WinwpjwbN2xkmZEXGZ5JanzEB8q_LyV9w9RBMjfkU2K0OMnbdV91qCVpNpwhTECFQPHsmc',
      href: '/collections/kitchen-dining',
    },
    {
      id: 'col-004',
      title: 'Bar & Glassware',
      imageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuC4krk2JRZSX24qC17rRN02uqSJku8_tZx8RxK2_2aUIEu5DIFigSAZnmZReS2Fgn78X7RymMQ5R3NRWzfzv4hjiCogtbzjZnvNcMHv9T0NyA8zQiOOJMTRf0A9ProOAZZFEWdUN4QbyZYO4Mx3fF4Vgk6EEwhtI7BHMJNVSk5s9Cy7lDYSccf2eVW0-2FypgqpuOq0J4qiV5Ss9OSIwhFGsOt8nsI4d_dPjJuvoptoMGH1aZJ-LKNZNNcE8OfC8pGFm828QJLcmSwO',
      href: '/collections/bar-glassware',
    },
  ]
}
